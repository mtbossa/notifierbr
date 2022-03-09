import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import _ from 'lodash';

export type JordanData = {
	name: string;
	url: string;
	imgUrl: string;
};
export class NikeFlashDropsMonitorService {
	public static getCurrentJordans = async (
		page: Page
	): Promise<Array<JordanData>> => {
		await page.reload({ timeout: 0 });
		let html = await page.evaluate(() => document.body.innerHTML);

		return this._findJordans(cheerio.load(html));
	};

	private static _findJordans = ($: cheerio.CheerioAPI): Array<JordanData> => {
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
