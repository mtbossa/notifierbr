import { Monitor } from './interfaces/Monitor';
import puppeteer, { Browser, Page } from 'puppeteer';
import {
	NikeFlashDropsMonitorService,
	JordanData,
} from '../services/nikeFlashDropsMonitorService';
import { CronJob } from 'cron';
import { Client } from 'discord.js';
import _ from 'lodash';
import { log } from '../helpers/general';

export class NikeFlashDropsMonitor implements Monitor {
	public lastLoadedJordans: Array<JordanData> = [];
	private page: Page | null = null;

	private browser: Browser | null = null;
	private _firstTime = true;

	constructor(private client: Client) {}

	async createBrowser(): Promise<void> {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		this.browser = browser;
	}

	async setPage(url: string): Promise<void> {
		const page = await this.browser!.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
		);
		await page.goto(url);
		this.page = page;
	}

	async start() {
		const job = new CronJob(
			'* * * * *', // Every 1 minute
			() => this._check(),
			null,
			true,
			undefined,
			null,
			true
		);
	}

	private async _check() {
		const reloadedPageJordans =
			await NikeFlashDropsMonitorService.getCurrentJordans(this.page!);
		const newJordans = _.differenceBy(
			reloadedPageJordans,
			this.lastLoadedJordans,
			'name'
		);

		if (this._firstTime) {
			this._firstTime = false;
			this.lastLoadedJordans = reloadedPageJordans;
			log('First time loading page: ', this.lastLoadedJordans);
			return;
		}

		if (newJordans.length > 0) {
			this.client.emit('flashDrop', newJordans);
			this.lastLoadedJordans = [...newJordans, ...this.lastLoadedJordans];
		} else {
			log('Last loaded Jordan Sneakers: ', this.lastLoadedJordans);
		}
	}
}
