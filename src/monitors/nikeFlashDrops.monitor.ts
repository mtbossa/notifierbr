import { Monitor } from './interfaces/Monitor';
import puppeteer, { Browser, Page } from 'puppeteer';
import {
	NikeFlashDropsMonitorService,
	JordanData,
} from '../services/nikeFlashDropsMonitorService';
import { CronJob } from 'cron';
import { Client } from 'discord.js';
import _ from 'lodash';
import { log, minToMs } from '../helpers/general';

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
		this._check();
	}

	private async _check() {
		log('Running NikeFlashDropsMonitor');
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
			setTimeout(this._check.bind(this), minToMs(1));
			return;
		}

		if (newJordans.length > 0) {
			this.client.emit('flashDrop', this.client, newJordans);
			this.lastLoadedJordans = [...newJordans, ...this.lastLoadedJordans];
		} else {
			log('Last loaded Jordan Sneakers: ', this.lastLoadedJordans);
		}

		setTimeout(this._check.bind(this), minToMs(1));
	}
}
