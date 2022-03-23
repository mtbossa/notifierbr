import { Client } from 'discord.js';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { secToMs, waitTimeout } from '../../../helpers/general';
import { NikeRestockRepositoryInterface } from '../repositories/NikeRestockRepositoryInterface';
import { NikeRestockAPIRequestData } from '../models/requests/NikeRestockAPIRequestData';
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
		protected nikeRestockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client,
	) {
	  super();
	  this._amountOfRequests = this.requestsObjects.length;
	}

	public async setUpPuppeteer() {
	  puppeteer.use(StealthPlugin());
	  puppeteer.use(
	    require('puppeteer-extra-plugin-block-resources')({
	      blockedTypes: new Set(['image', 'stylesheet', 'media', 'font']),
	    }),
	  );
	  this._browser = await puppeteer.launch({});
	  this._page = await this._browser.newPage();

	  return this;
	}

	private async _resetBrowser() {
	  this.log.info(
	    `Got banned, stopped on index ${this._currentRequestIndex} on request ${
	      this.requestsObjects[this._currentRequestIndex].sneakerName
	    }. Reseting browser`,
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
	      await waitTimeout({ min: secToMs(5), max: secToMs(20) });
	      this.log.info(`Checking stock of ${this._currentRequest!.sneakerName}`);
	      let isSneakerAvailable = await this.nikeRestockRepository.isSneakerAvailable(
					this._currentRequest!,
					this._page!,
	      );
	      isSneakerAvailable = false;
	      this._currentRequestIndex++;

	      if (!isSneakerAvailable) {
	        if (await this.nikeRestockRepository.isCurrentlyAvailableOnStore(this._currentRequest!)) {
	          await this.nikeRestockRepository.setSneakerAvailability(this._currentRequest!, { available: false });
	        }
	        continue;
	      }
	      if (await this.nikeRestockRepository.isCurrentlyAvailableOnStore(this._currentRequest!)) continue;

	      const sneaker = await this.nikeRestockRepository.getSneaker(this._currentRequest!);
	      this._discordClient.emit('restock', this._discordClient, sneaker);
	      await this.nikeRestockRepository.setSneakerAvailability(this._currentRequest!, { available: true });
	    } while (this._notPassedThroughAllRequests());

	    this._setCurrentIndexToFirstRequest();
	    this.reRunCheck();
	  } catch (e) {
	    if (e instanceof Error) {
	      if (e.message === 'Banned') {
	        await this._resetBrowser();
	        this.reRunCheck();
	      } else {
	        this.reRunCheck();
	      }
	    }
	  }
	}
}
