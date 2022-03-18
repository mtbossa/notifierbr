import * as cheerio from 'cheerio';
import { Browser, HTTPResponse, Page, Product } from 'puppeteer';
import UserAgent from 'user-agents';
import { log } from '../../helpers/general';
import logger from '../../logger';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import {
	NikeProductDataLayerResponse,
	ProductInfo,
} from '../../requests/nike/interfaces/responses/NikeSneakerProductResponseInterface';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorService';
import { NikeRestockRepositoryInterface } from '../NikeRestockRepositoryInterface';

export class NikeRestockPuppeteerScrapeRepository implements NikeRestockRepositoryInterface {
	constructor(private _nikeRestockMonitorService: NikeRestockMonitorService, private userAgent: UserAgent) {}

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
		logger.warn({ url: sneaker.url }, 'Selectors .esgotado and .label-indisponivel were not found');

		const hasEsgotadoText = html.includes('esgotado');
		if (hasEsgotadoText) {
			logger.warn({ url: sneaker.url, html }, "Found text 'esgotado' inside HTML, returning false (not available)");
			return false;
		}
		const hasIndisponivelText = html.includes('indisponível');
		if (hasIndisponivelText) {
			logger.warn({ url: sneaker.url, html }, "Found text 'indisponível' inside HTML, returning false (not available)");
			return false;
		}

		if (html.includes(sneaker.sneakerName)) {
			logger.warn(
				{ sneakerName: sneaker.sneakerName, html },
				"Didn't find 'esgotado' or 'indisponível' words and found sneaker name inside HTML, retuning true (considered available)"
			);
			return true;
		}

		logger.warn(
			{ url: sneaker.url, html },
			"Didn't find 'esgotado' or 'indisponível' and didn't found sneaker name inside HTML, retuning false (probably banned)"
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
				logger.info(`Found .label-indiponivel, not available.`);
				return false;
			}

			const elementWithEsgotadoClass = $('.esgotado');
			const foundElementWithEsgotadoClass = elementWithEsgotadoClass.length > 0;

			if (!foundElementWithEsgotadoClass) {
				// didn't find any pre-knowledged selectors (neither .label-indisponivel nor .esgotado), so Nike could've changed them
				// in order to check if is available or not, will relly upon finding 'esgotado' or 'insiponível' text inside the whole HTML
				// TODO test with some nike pages (snkrs esgotados, snkrs não estados, tênis fora de snkrs esgotados e não esgotados)
				// TODO email this to me so go check selectors
				const isAvailable = this._isAvailableByCheckingHTMLForKeywords(sneaker, html);
				return isAvailable;
			}

			const isAvailable = elementWithEsgotadoClass.hasClass('.hidden');

			logger.info(`.esgotado hasHiddenClass (.esgotado .hidden): ${isAvailable}`);
			return isAvailable; // if has class .hidden (true), means its available
		} catch (e: unknown) {
			if (e instanceof Error) {
				logger.error({ err: e });
				if (e.message === 'Banned') {
					throw e;
				}
			}
			return false;
		}
	}
}
