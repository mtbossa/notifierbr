import puppeteer, { Browser, Page } from 'puppeteer';
import { StockAvailabilityMonitorService } from '../services/stockAvailabilityMonitorService';
import { Client } from 'discord.js';
import { CronJob } from 'cron';
import { Monitor } from './interfaces/Monitor';
import { Prisma, prisma, PrismaClient, Product } from '@prisma/client';
import { inspect } from 'util';

export class StockAvailabilityMonitor implements Monitor {
	private browser: Browser | null = null;
	page: Page | null = null;
	productsBeingMonitored: Array<any> = [];

	constructor(private client: Client, private prismaClient: PrismaClient) {}

	private async getProductsBeingMonitored() {
		this.productsBeingMonitored = await this.prismaClient.product.findMany({
			where: { monitors: { every: { monitor: { type: 'STOCK_CHECK' } } } },
			select: {
				name: true,
				monitors: { select: { monitor: { select: { type: true } } } },
				stores: {
					select: {
						product_url: true,
						store: {
							select: {
								name: true,
								html_selectors: { select: { stock_availability: true } },
							},
						},
					},
				},
			},
		});
	}

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
		await this.getProductsBeingMonitored();
		console.log(this.productsBeingMonitored);
		const job = new CronJob(
			'*/15 * * * *', // Every 1 minute
			() => this.test(),
			null,
			true,
			undefined,
			null,
			true
		);
	}

	private test() {
		console.log(
			inspect(
				this.productsBeingMonitored,
				false,
				null,
				true /* enable colors */
			)
		);
	}

	// private async _check() {
	// 	const soldOff = await StockAvailabilityMonitorService.isSoldOff(this.page!);

	// 	if (!soldOff) {
	// 		console.log('NÃO ESTÁ MAIS ESGOTADO');
	// 		if (client.isReady()) client.emit('stockRefilled', product);
	// 	} else {
	// 		console.log('CONTINUA ESGOTADO');
	// 		client.emit('outOfStock', 'Out of stock');
	// 	}
	// }
}
