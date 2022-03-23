import * as cheerio from 'cheerio';
import { Page } from 'puppeteer';
import UserAgent from 'user-agents';
import logger from '../../logger';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../../prismaClient';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorService';
import { NikeRestockRepositoryInterface } from '../NikeRestockRepositoryInterface';

export class NikeRestockPuppeteerScrapeRepository extends NikeRestockRepositoryInterface {
  constructor(private _nikeRestockMonitorService: NikeRestockMonitorService, private userAgent: UserAgent) {
    super();
  }

  async setSneakerAvailability(requestObject: NikeRestockAPIRequestData, availability: { available: boolean }) {
    try {
      await prismaClient.productsOnStore.update({
        where: { product_url: requestObject.url },
        data: {
          available: availability.available,
        },
      });
    } catch (e) {
      logger.error({ err: e });
    }
  }

  async isCurrentlyAvailableOnStore(requestObject: NikeRestockAPIRequestData): Promise<boolean> {
    try {
      const productOnStore = await prismaClient.productsOnStore.findUnique({
        where: { product_url: requestObject.url },
      });

      return productOnStore!.available;
    } catch (e) {
      logger.error({ err: e });
      return false;
    }
  }

  async getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData> {
    const mappedSneakerData = this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
      name: requestObject.sneakerName,
      url: requestObject.url,
      imgUrl: requestObject.imgUrl,
    });

    return mappedSneakerData;
  }

  private async _getPageHTML(page: Page): Promise<string> {
    return await page.evaluate(() => document.body.innerHTML);
  }

  private _getCheerioObject(html: string) {
    return cheerio.load(html);
  }

  private _isAvailableByCheckingHTMLForKeywords(sneaker: NikeRestockAPIRequestData, html: string) {
    this.log.info({ url: sneaker.url }, 'Selectors .esgotado and .label-indisponivel were not found');

    if (html.includes('esgotado')) {
      this.log.warn({ url: sneaker.url, html }, "Found text 'esgotado' inside HTML, returning false (not available)");
      return false;
    }

    if (html.includes('indisponível')) {
      this.log.warn(
        { url: sneaker.url, html },
        "Found text 'indisponível' inside HTML, returning false (not available)",
      );
      return false;
    }

    if (html.includes(sneaker.sneakerName)) {
      this.log.warn(
        { sneakerName: sneaker.sneakerName, html },
        "Didn't find 'esgotado' or 'indisponível' words but found sneaker name inside HTML, retuning true (considered available). Selectors changed.",
      );
      return true;
    }

    this.log.info(
      { url: sneaker.url, html },
      "Didn't find 'esgotado' or 'indisponível' and didn't find sneaker name inside HTML, retuning false (probably banned)",
    );

    throw new Error('Banned');
  }

  public async isSneakerAvailable(sneaker: NikeRestockAPIRequestData, page: Page): Promise<boolean> {
    try {
      await page.setUserAgent(this.userAgent.random().toString());
      await page.goto(sneaker.url, { waitUntil: 'domcontentloaded' });

      const html = await this._getPageHTML(page);
      const $ = this._getCheerioObject(html);

      const elementWithLabelIndisponivelClass = $('.label-indisponivel');
      const foundElementWithLabelIndisponivelClass = elementWithLabelIndisponivelClass.length > 0;
      if (foundElementWithLabelIndisponivelClass) {
        // if any element in the page has this class, means its out of stock (know this by analysing Nike's website pages)
        this.log.info('Found .label-indiponivel, not available.');
        return false;
      }

      const elementWithEsgotadoClass = $('.esgotado');
      const foundElementWithEsgotadoClass = elementWithEsgotadoClass.length > 0;

      if (!foundElementWithEsgotadoClass) {
        // didn't find any pre-knowledged selectors (neither .label-indisponivel nor .esgotado), so Nike could've changed them
        // in order to check if is available or not, will relly upon finding 'esgotado' or 'insiponível' text inside the whole HTML
        const isAvailable = this._isAvailableByCheckingHTMLForKeywords(sneaker, html);
        return isAvailable;
      }

      const isAvailable = elementWithEsgotadoClass.hasClass('.hidden');

      this.log.info(`${sneaker.sneakerName} class .esgotado hasHiddenClass (.esgotado .hidden): ${isAvailable}`);
      return isAvailable; // if has class .hidden (true), means its available
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log.error({ err: e });
        if (e.message === 'Banned') {
          throw e;
        }
      }
      return false;
    }
  }
}
