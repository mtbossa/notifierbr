import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export class StockAvailabilityMonitorService {
	public static isSoldOff = async (page: Page): Promise<boolean> => {
		await page.reload();

		let html = await page.evaluate(() => document.body.innerHTML);
		const $ = cheerio.load(html);
		const soldOff = !$('.esgotado').hasClass('hidden'); // If has class hidden, means its not sold off

		return soldOff;
	};
}
