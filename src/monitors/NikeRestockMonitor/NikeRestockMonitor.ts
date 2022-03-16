import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { Page } from 'puppeteer';
import { minToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeRestockRepositoryInterface } from '../../repositories/NikeRestockRepositoryInterface';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import {
	NikeProductDataLayerResponse,
	ProductInfo,
} from '../../requests/nike/interfaces/responses/NikeSneakerProductResponseInterface';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorSerivce';
import { Monitor } from '../Monitor';

export class NikeRestockMonitor extends Monitor {
	public checkMinutesTimeout: number = minToMs(1);

	private count = 0;
	private currentRequestObject?: NikeRestockAPIRequestData;
	private amountOfRequests?: number;

	constructor(
		protected requestsObjects: NikeRestockAPIRequestData[],
		protected restockRepository: NikeRestockRepositoryInterface,
		private page: Page,
		private _discordClient: Client,
		private _nikeRestockMonitorService: NikeRestockMonitorService
	) {
		super();

		this.amountOfRequests = this.requestsObjects.length;

		this.page.on('response', async res => {
			if (res.url() == 'https://www.nike.com.br/DataLayer/dataLayer') {
				try {
					logger.info('found dataLayer');
					const dataLayer: NikeProductDataLayerResponse = await res.json();
					this._runLogic(dataLayer.productInfo);
					if (this.count === this.amountOfRequests! - 1) {
						this.count = 0;
					} else {
						this.count++;
					}
					await this.check();
				} catch (e) {
					logger.error({ err: e });
				}
			}
		});
	}

	private _runLogic(productInfo: ProductInfo) {
		if (productInfo && this.currentRequestObject) {
			const sneaker = this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
				productInfo: productInfo,
				name: this.currentRequestObject.sneakerName,
				url: this.currentRequestObject.url,
				imgUrl: this.currentRequestObject.imgUrl,
			});

			if (sneaker && sneaker.available) {
				this._discordClient.emit('restock', this._discordClient, sneaker);
			}

			logger.info(
				{ finishedLogic: this.currentRequestObject.sneakerName },
				`Finished Logic: ${this.currentRequestObject.sneakerName} - ${productInfo.name}`
			);
		}
	}

	async check(): Promise<void> {
		try {
			await waitTimeout(1000, 10000).then(res => console.log(res));
			this.currentRequestObject = this.requestsObjects[this.count];
			this.restockRepository.goToSneakerPage(this.currentRequestObject!);
		} catch (e) {
			if (e instanceof Error) {
				logger.error({ err: e });
			}
		}
	}
}
