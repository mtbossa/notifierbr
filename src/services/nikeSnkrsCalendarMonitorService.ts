import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import _ from 'lodash';

export type SnkrsData = {
	name: string;
	url: string;
	imgUrl: string;
	price: string;
	launchDate: string;
};
export class NikeSnkrsCalendarMonitorService {
	public static getCurrentSnkrs = async (
		page: Page
	): Promise<Array<SnkrsData>> => {
		await page.reload();
		let html = await page.evaluate(() => document.body.innerHTML);

		return this._findSnkrs(cheerio.load(html));
	};

	private static async _getSnkrPageCheerio(url: string, browser: Browser) {
		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
		);
		await page.goto(url);
		let html = await page.evaluate(() => document.body.innerHTML);
		await page.close();

		return cheerio.load(html);
	}

	private static _getSnkrPrice($: cheerio.CheerioAPI) {
		const test = $('.js-preco').text();

		return $('.js-preco').text();
	}

	private static _getSnkrLaunchDate($: cheerio.CheerioAPI) {
		const test = $('.detalhes-produto__disponibilidade').text();
		return $('.detalhes-produto__disponibilidade').text();
	}

	private static async _findSnkrs(
		$: cheerio.CheerioAPI
	): Promise<Array<SnkrsData>> {
		const latestTwentySnkrs = $('.produto__imagem').splice(0, 20); // Only latest 20 are needed, because they won't push more then 10 snkrs calendars at onnce

		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		let snkrsArray: Array<SnkrsData> = [];

		for (const snkrNode of latestTwentySnkrs) {
			const test = $(snkrNode);
			const snkrUrl = $(snkrNode).children('a').attr('href');
			const snkrImgUrl = $(snkrNode).children('a').children().attr('data-src');
			const snkrName = $(snkrNode)
				.children('.produto__detalhe')
				.children('.produto__detalhe-titulo')
				.text();

			const $snkrPage = await this._getSnkrPageCheerio(snkrUrl!, browser);

			const snkrPrice = this._getSnkrPrice($snkrPage);
			const snkrLaunchDate = this._getSnkrLaunchDate($snkrPage);

			const currentSnkr: SnkrsData = {
				url: snkrUrl!,
				imgUrl: snkrImgUrl!,
				name: snkrName,
				price: snkrPrice,
				launchDate: snkrLaunchDate,
			};

			snkrsArray = [currentSnkr, ...snkrsArray];
		}

		return snkrsArray;
	}
}
