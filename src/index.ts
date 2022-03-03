import { checkPrime } from 'crypto';
import { BrowserContext, Page } from 'puppeteer';

const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.nike.com.br/snkrs/air-jordan-1-153-169-211-351285';

const configureBrowser = async () => {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage();
	await page.goto(url);
	return page;
};

const checkSoldOff = async (page: Page) => {
	await page.reload();
	let html = await page.evaluate(() => document.body.innerHTML);
	console.log(html);
};

const monitor = async () => {
	let page = await configureBrowser();
	await checkSoldOff(page);
};

monitor();
