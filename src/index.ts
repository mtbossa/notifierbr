import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { CronJob } from 'cron';
import client from './bot';
import { exitHandler } from './helpers';

const product = {
	name: 'Air Jordan 1	Patent Bred',
	url: 'https://www.nike.com.br/snkrs/air-jordan-1-153-169-211-351285',
	image_url:
		'https://images.lojanike.com.br/1024x1024/produto/tenis-air-jordan-1-retro-high-og-masculino-555088-063-1-11637067284.jpg',
	store: 'Nike',
	store_image:
		'https://3dwarehouse.sketchup.com/warehouse/v1.0/publiccontent/ba6c1527-a9c5-4efa-af58-0930b3a8aa34',
};

const configureBrowser = async () => {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage();
	// set user agent (override the default headless User Agent)
	await page.setUserAgent(
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
	);
	await page.goto(product.url);

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

	// TODO change to !soldOff. Its this way for testing pourpouse
	if (soldOff) {
		console.log('NÃO ESTÁ MAIS ESGOTADO');
		if (client.isReady()) client.emit('stockRefilled', product);
	} else {
		console.log('CONTINUA ESGOTADO');
		client.emit('outOfStock', 'Out of stock');
	}
};

(async () => {
	process.stdin.resume();

	process.on('SIGINT', exitHandler.bind(null, { exit: true }));

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
