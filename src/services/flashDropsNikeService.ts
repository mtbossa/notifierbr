import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { arrayDifference as diffRecentWithCurrent } from '../helpers/array';

let currentJordans: Array<string> = [];

export class FlashDropsNikeService {
	constructor() {}

	public static hasNewJordans = async (page: Page) => {
		await page.reload();
		let html = await page.evaluate(() => document.body.innerHTML);
		const recentJordans = this._getRecentJordans(cheerio.load(html));
		const diff = diffRecentWithCurrent<string>(recentJordans, currentJordans);

		return diff;
	};

	private static _getRecentJordans = ($: cheerio.CheerioAPI) => {
		return $('.produto__nome')
			.filter(function () {
				const regex = new RegExp('Tênis Air Jordan');
				const content = $(this).text();
				return content ? regex.test(content) : false;
			})
			.map(function () {
				return $(this).text();
			})
			.toArray();
	};
}
