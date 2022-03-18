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
	public checkTimeout: number = secToMs(10);

	private _browser?: Browser;

	private _page?: Page;

	constructor(
		protected requestsObjects: NikeRestockAPIRequestData[],
		protected restockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client,
	) {
	  super();
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
		this._browser!.close();
		this._browser = await puppeteer.launch({});
		this._page = await this._browser.newPage();
		this._page.reload();

		return this;
	}

	async check(): Promise<void> {
	  for (const requestObject of this.requestsObjects) {
	    try {
	      await waitTimeout(secToMs(5), secToMs(20));
	      const isSneakerAvailable = await this.restockRepository.isSneakerAvailable(requestObject, this._page!);
	      if (!isSneakerAvailable) continue;

	      const sneaker = await this.restockRepository.getSneaker(requestObject);
	      this._discordClient.emit('restock', this._discordClient, sneaker);
	    } catch (e) {
	      if (e instanceof Error) {
	        if (e.message === 'Banned') {
	          await this._resetBrowser();
	        }
	      }
	    }
	  }
	  logger.info(`Passed all requestObjets, waiting ${this.checkTimeout}ms to rerun...`);
	  this.reRun();
	}
}
