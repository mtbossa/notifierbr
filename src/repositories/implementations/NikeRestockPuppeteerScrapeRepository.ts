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
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorSerivce';
import { NikeRestockRepositoryInterface } from '../NikeRestockRepositoryInterface';

export class NikeRestockPuppeteerScrapeRepository implements NikeRestockRepositoryInterface {
	constructor(
		private _nikeRestockMonitorService: NikeRestockMonitorService,
		private browser: Browser,
		private page: Page,
		private userAgent: UserAgent
	) {}

	async getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData | null> {
		let mappedSneakerData = null;
		logger.info(`getSneaker: ${requestObject.sneakerName}`);

		const isAvailable = await this._isSneakerAvailable(requestObject.url);
		logger.info(`isAvailable: ${isAvailable}`);

		mappedSneakerData = this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
			isAvailable: isAvailable,
			name: requestObject.sneakerName,
			url: requestObject.url,
			imgUrl: requestObject.imgUrl,
		});

		return mappedSneakerData;
	}

	private async _isSneakerAvailable(sneakerUrl: string): Promise<boolean> {
		try {
			await this.page.goto(sneakerUrl);

			const html = await this.page.evaluate(() => document.body.innerHTML);
			const $ = cheerio.load(html);

			const labelIndisponivel = $('.label-indisponivel');
			logger.info(`labelIndisponivel.length ${labelIndisponivel.length}`);
			const esgotado = $('.esgotado');
			logger.info(`esgotado.length ${esgotado.length}`);
			const hasClassHidden = esgotado.hasClass('.hidden');
			logger.info(`esgotado.hasClass('.hidden') ${hasClassHidden}`);

			if (labelIndisponivel.length === 0 && esgotado.length === 0) {
        // TODO test with some nike pages (snkrs esgotados, snkrs não estados, tênis fora de snkrs esgotados e não esgotados)
				// didn't find any pre-knowledge selectors, so Nike could've changed them, so gotta check for esgotado or indisponível words inside the html
				logger.warn({ url: sneakerUrl }, 'Selectors .esgotado and .label-indisponivel were not found');
				const hasEsgotadoText = html.includes('esgotado');
				if (hasEsgotadoText) return false;
				const hasIndisponivelText = html.includes('indisponível');
				if (hasIndisponivelText) return false;

				return true;
			}

			if (labelIndisponivel.length > 0) return false; // if page has this class, means its out of stock
			if (esgotado.length === 0) return true; // if got here, means there's no labelIndisponivel, so got to check for .esgotado class
			return hasClassHidden; // if has class hidden, means its available
		} catch (e: unknown) {
			if (e instanceof Error) {
				logger.error({ err: e });
			}
			throw new Error('Nike changed selectors for esgotados');
		}
	}
}
