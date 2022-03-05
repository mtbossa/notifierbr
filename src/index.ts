import puppeteer from 'puppeteer';
import { CronJob } from 'cron';
import { exitHandler } from './helpers/general';
import { monitorStockAvailability } from './monitors/stockAvailability';

const page_info = {
	url: 'https://www.nike.com.br/lancamento-todos-110',
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
	await page.goto(page_info.url);

	return page;
};

// Starts all process
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
