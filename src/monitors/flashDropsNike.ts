import { Monitor } from './interfaces/Monitor';
import puppeteer, { Browser, Page } from 'puppeteer';
import { FlashDropsNikeService } from '../services/flashDropsNikeService';
import { CronJob } from 'cron';
import { Client } from 'discord.js';

export class NikeFlashDropsMonitor implements Monitor {
	private browser: Browser | null = null;
	private page: Page | null = null;

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
			'*/15 * * * * *',
			() => this._check(),
			null,
			true,
			undefined,
			null,
			true
		);
		job.start();
	}

	private async _check() {
		const newJordans = await FlashDropsNikeService.hasNewJordans(this.page!);
		if (newJordans.length > 0) this.client.emit('flashDrop', newJordans);
		else console.log('no new jordan');
	}
}
