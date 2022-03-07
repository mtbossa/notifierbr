import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import _ from 'lodash';

export type JordanData = {
	name: string;
	url: string;
	imgUrl: string;
};
export class FlashDropsNikeService {
	private static firstTime = true;
	public static currentJordans: Array<JordanData> = [];

	public static hasNewJordans = async (
		page: Page
	): Promise<Array<JordanData>> => {
		await page.reload();
		let html = await page.evaluate(() => document.body.innerHTML);
		const recentJordans = this._getRecentJordans(cheerio.load(html));

		// if (this.firstTime) {
		// 	this.currentJordans = recentJordans;
		// 	this.firstTime = !this.firstTime;
		// 	return [];
		// }

		const diff = _.differenceBy(recentJordans, this.currentJordans, 'name');

		return diff;
	};

	private static _getRecentJordans = (
		$: cheerio.CheerioAPI
	): Array<JordanData> => {
		return $('.produto__nome')
			.filter(function () {
				const regex = new RegExp('Tênis Air Jordan');
				const content = $(this).text();
				return content ? regex.test(content) : false;
			})
			.map(function () {
				return {
					name: $(this).text(),
					url: $(this).attr('href'),
					imgUrl: $(this)
						.parent()
						.prev()
						.find('.produto__imagem-principal')
						.attr('data-src'),
				} as JordanData;
			})
			.toArray();
	};
}
