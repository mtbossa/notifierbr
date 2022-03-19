import { Client } from 'discord.js';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { minToMs, secToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeRestockRepositoryInterface } from '../../repositories/NikeRestockRepositoryInterface';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { Monitor } from '../Monitor';

export class NikeRestockMonitor extends Monitor {
	protected minTimeout: number = secToMs(10);
	protected maxTimeout: number = secToMs(60);

	private _browser?: Browser;
	private _currentRequest?: NikeRestockAPIRequestData;
	private _currentRequestIndex: number = 0;
	private _amountOfRequests?: number;
	private _page?: Page;

	constructor(
		protected requestsObjects: NikeRestockAPIRequestData[],
		protected restockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client
	) {
		super();
		this._amountOfRequests = this.requestsObjects.length;
	}

	public async setUpPuppeteer() {
		puppeteer.use(StealthPlugin());
		puppeteer.use(
			require('puppeteer-extra-plugin-block-resources')({
				blockedTypes: new Set(['image', 'stylesheet', 'media', 'font']),
			})
		);
		this._browser = await puppeteer.launch({});
		this._page = await this._browser.newPage();

		return this;
	}

	private async _resetBrowser() {
		this.log.info(
			`Got banned, stopped on index ${this._currentRequestIndex} on request ${
				this.requestsObjects[this._currentRequestIndex].sneakerName
			}. Reseting browser`
		);

		this._browser!.close();
		this._browser = await puppeteer.launch({});
		this._page = await this._browser.newPage();
		await this._page.reload();

		return this;
	}

	private _setCurrentIndexToFirstRequest() {
		this._currentRequestIndex = 0;
	}

	private _notPassedThroughAllRequests() {
		return this._currentRequestIndex! <= this._amountOfRequests! - 1;
	}

	private _setCurrentRequest() {
		this._currentRequest = this.requestsObjects[this._currentRequestIndex];
	}

	async check(): Promise<void> {
		try {
			do {
				this._setCurrentRequest();
				this.log.info(`Checking stock of ${this._currentRequest!.sneakerName}`);
				await waitTimeout({ min: secToMs(5), max: secToMs(20) });
				const isSneakerAvailable = await this.restockRepository.isSneakerAvailable(this._currentRequest!, this._page!);
				this._currentRequestIndex++;

				if (!isSneakerAvailable) continue;

				const sneaker = await this.restockRepository.getSneaker(this._currentRequest!);
				this._discordClient.emit('restock', this._discordClient, sneaker);
			} while (this._notPassedThroughAllRequests());

			this._setCurrentIndexToFirstRequest();
			this.reRunCheck();
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Banned') {
					await this._resetBrowser();
					this.reRunCheck();
				}
			}
		}
	}
}
