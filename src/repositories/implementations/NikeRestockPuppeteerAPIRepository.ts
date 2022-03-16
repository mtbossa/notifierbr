import axios, { AxiosRequestConfig } from 'axios';
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

export class NikeRestockPuppeteerAPIRepository implements NikeRestockRepositoryInterface {
	constructor(
		private _nikeRestockMonitorService: NikeRestockMonitorService,
		private browser: Browser,
		private page: Page,
		private userAgent: UserAgent
	) {}

	async getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData | null> {
		let mappedSneakerData = null;

		const sneakerData = await this._getSneakerData(requestObject.url);

		logger.info(
			{ url: requestObject.url, available: sneakerData?.availability },
			`Getting sneaker data: ${requestObject.sneakerName}`
		);

		if (sneakerData) {
			mappedSneakerData = this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
				productInfo: sneakerData,
				name: requestObject.sneakerName,
				url: requestObject.url,
				imgUrl: requestObject.imgUrl,
			});
		}

		return mappedSneakerData;
	}

	private async _waitForDataLayerCall(sneakerUrl: string): Promise<ProductInfo | undefined> {
		return new Promise(async (resolve, reject) => {
			try {
				this.page.on('response', async res => {
					if (res.url() == 'https://www.nike.com.br/DataLayer/dataLayer') {
						try {
							const dataLayer: NikeProductDataLayerResponse = await res.json();
							resolve(dataLayer.productInfo);
						} catch (e) {
							reject(e);
						}
					}
				});
				await this.page.setUserAgent(this.userAgent.random().toString());
				await this.page.goto(sneakerUrl, {
					timeout: 0,
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	private async _getSneakerData(sneakerUrl: string): Promise<ProductInfo | undefined> {
		try {
			return await this._waitForDataLayerCall(sneakerUrl);
		} catch (e: unknown) {
			if (e instanceof Error) logger.error({ err: e });
		}
	}
}
