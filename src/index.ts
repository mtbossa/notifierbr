import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { CronJob } from 'cron';

const url = 'https://www.nike.com.br/snkrs/air-jordan-1-153-169-211-351285';

const configureBrowser = async () => {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage();
	// set user agent (override the default headless User Agent)
	await page.setUserAgent(
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
	);
	await page.goto(url);

	return page;
};

const isSoldOff = async (page: Page): Promise<boolean> => {
	await page.reload();

	let html = await page.evaluate(() => document.body.innerHTML);
	const $ = cheerio.load(html);
	const soldOff = !$('.esgotado').hasClass('hidden'); // If has class hidden, means its not sold off

	return soldOff;
};

const monitorStockAvailability = async (page: Page) => {
	const soldOff = await isSoldOff(page);

	if (!soldOff) {
		console.log('NÃO ESTÁ MAIS ESGOTADO');
	} else {
		console.log('CONTINUA ESGOTADO');
	}
};

(async () => {
	let page = await configureBrowser();
	const job = new CronJob(
		'*/15 * * * * *',
		() => monitorStockAvailability(page),
		null,
		true,
		undefined,
		null,
		true
	);
	job.start();
})();
