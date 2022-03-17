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
	constructor(
		private _nikeRestockMonitorService: NikeRestockMonitorService,
		private browser: Browser,
		private page: Page,
		private userAgent: UserAgent
	) {}

	async getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData> {
		const mappedSneakerData = this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
			name: requestObject.sneakerName,
			url: requestObject.url,
			imgUrl: requestObject.imgUrl,
		});

		return mappedSneakerData;
	}

	private async _getPageHTML(): Promise<string> {
		return await this.page.evaluate(() => document.body.innerHTML);
	}

	private _getCheerioObject(html: string) {
		return cheerio.load(html);
	}

	private _foundElementWithLabelIndisponivelClass(cheerioElement: cheerio.Cheerio<cheerio.Element>) {
		return cheerioElement.length > 0;
	}

	private _isAvailableByCheckingHTMLForKeywords(sneakerUrl: string, html: string) {
		logger.warn({ url: sneakerUrl }, 'Selectors .esgotado and .label-indisponivel were not found');

		const hasEsgotadoText = html.includes('esgotado');
		if (hasEsgotadoText) {
			logger.warn({ url: sneakerUrl }, "Found text 'esgotado' inside HTML, returning false (not available)");
			return false;
		}
		const hasIndisponivelText = html.includes('indisponível');
		if (hasIndisponivelText) {
			logger.warn({ url: sneakerUrl }, "Found text 'indisponível' inside HTML, returning false (not available)");
			return false;
		}

		logger.warn(
			{ url: sneakerUrl },
			"Didn't find 'esgotado' or 'indisponível' words inside HTML, retuning true (available)"
		);

		return true;
	}

	public async isSneakerAvailable(sneakerUrl: string): Promise<boolean> {
		try {
			await this.page.goto(sneakerUrl);

			const html = await this._getPageHTML();
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
				const isAvailable = this._isAvailableByCheckingHTMLForKeywords(sneakerUrl, html);
				return isAvailable;
			}

			const isAvailable = elementWithEsgotadoClass.hasClass('.hidden');

			logger.info(`.esgotado hasHiddenClass (.esgotado .hidden): ${isAvailable}`);
			return isAvailable; // if has class .hidden (true), means its available
		} catch (e: unknown) {
			if (e instanceof Error) {
				logger.error({ err: e });
			}
			return false;
		}
	}
}
