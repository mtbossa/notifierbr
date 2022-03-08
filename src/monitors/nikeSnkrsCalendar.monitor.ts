import { Monitor } from './interfaces/Monitor';
import puppeteer, { Browser, Page } from 'puppeteer';
import {
	NikeSnkrsCalendarMonitorService,
	SnkrsData,
} from '../services/nikeSnkrsCalendarMonitorService';
import { CronJob } from 'cron';
import { Client } from 'discord.js';
import _ from 'lodash';
import { log, minToMs } from '../helpers/general';

export class NikeSnkrsCalendarMonitor implements Monitor {
	public lastLoadedSnkrs: Array<SnkrsData> = [];
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
		log('Running NikeSnkrsCalendarMonitor');
		const reloadedPageSnkrs =
			await NikeSnkrsCalendarMonitorService.getCurrentSnkrs(this.page!);

		const newSnkrs = _.differenceBy(
			reloadedPageSnkrs,
			this.lastLoadedSnkrs,
			'name'
		);

		if (this._firstTime) {
			this._firstTime = false;
			this.lastLoadedSnkrs = reloadedPageSnkrs;

			log('First time loading snkrs page: ', this.lastLoadedSnkrs);
			setTimeout(this._check.bind(this), minToMs(3));
			return;
		}

		if (newSnkrs.length > 0) {
			this.client.emit('newSnkrsOnNikeCalendar', this.lastLoadedSnkrs);
			this.lastLoadedSnkrs = [...newSnkrs, ...this.lastLoadedSnkrs];
		} else {
			log('Last loaded Calendar Sneakers: ', this.lastLoadedSnkrs);
		}
		
		setTimeout(this._check.bind(this), minToMs(3));
	}
}
