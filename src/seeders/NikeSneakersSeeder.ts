import { PrismaClient } from '@prisma/client';
import { StockxAPIRequestData } from '../requests/nike/interfaces/requests/StockxAPIRequestData';
import puppeteer from 'puppeteer-extra';
import { Product, StockxResponse } from '../requests/nike/interfaces/responses/StockxResponseInterface';
import logger from '../logger';
import { log } from '../helpers/general';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import fs from 'fs';

const configurePuppeteer = async () => {
	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	const userAgent = new UserAgent({ deviceCategory: 'desktop' });

	return { page, userAgent };
};

const randomUserAgent = (userAgent: UserAgent) => {
	return userAgent.random().toString();
};

const prismaClient = new PrismaClient();
const requestsObjects: StockxAPIRequestData[] = require('../../requests/nike/stockx-nike-requests.json');

const appendNextPageParam = (pageNumber: string | null, currentUrl: string) => {
	if (!pageNumber || !currentUrl) return null;

	const obUrl: URL = new URL(currentUrl);

	// if the current url doenst have the page filter, must append
	if (!obUrl.searchParams.get('page')) {
		obUrl.searchParams.append('page', pageNumber);
	} else {
		obUrl.searchParams.set('page', pageNumber);
	}

	return obUrl.toString();
};

const getPageNumber = (baseWebsiteUrl: string, nextPageUrl?: string) => {
	if (!nextPageUrl) return null; // TODO throw new kind of error instead of null
	return new URL(`${baseWebsiteUrl}${nextPageUrl}`).searchParams.get('page');
};

function randomIntFromInterval(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

const timoutPromise = () =>
	new Promise((resolve, reject) => {
		const timeoutTime = randomIntFromInterval(1000, 10000);
		setTimeout(() => {
			resolve(`waited ${timeoutTime}`);
		}, timeoutTime);
	});

const createProducts = async (
	products: Product[],
	pageTotalAmount: string,
	currentPageNumber: string | null,
	search: string
) => {
	for (const product of products) {
		try {
			const foundProduct = await prismaClient.product.findUnique({
				where: { style_code: product.styleId },
			});
			if (foundProduct) continue;
			const newProduct = await prismaClient.product.create({
				data: {
					name: product.title,
					style_code: product.styleId,
					release_date: new Date(product.releaseDate),
					brand: product.brand,
				},
			});
			logger.info({ newProduct }, `Product created. Page ${currentPageNumber}/${pageTotalAmount}. Search: ${search}`);
		} catch (e) {
			if (e instanceof Error) {
				logger.error({ err: e });
			}
		}
	}
};

(async () => {
	const { page, userAgent } = await configurePuppeteer();

	// requestsObjects are all the searchs we will make
	for (const requestObject of requestsObjects) {
		if (requestObject.alreadyScraped) {
			continue;
		}

		let currentAPIUrl: string | null = requestObject.currentAPIUrl; // the first iteration is without page
		let pageTotalAmount = null;
		let currentPageNumber: string | null = '1';
		let firstTime = true;
		let content = '';

		try {
			do {
				await page.setUserAgent(randomUserAgent(userAgent));
				await page.goto(currentAPIUrl, { timeout: 0 });
				content = await page.content();
				const data: StockxResponse = await page.evaluate(() => {
					console.log(document.querySelector('body')!.innerText);
					return JSON.parse(document.querySelector('body')!.innerText);
				});
				if (firstTime) {
					pageTotalAmount = getPageNumber(requestObject.baseWebsiteUrl, data.Pagination.lastPage);
					firstTime = false;
				}

				createProducts(
					data.Products.filter(product => product.productCategory === 'sneakers'),
					pageTotalAmount!,
					currentPageNumber,
					requestObject.search
				);

				logger.info({ url: currentAPIUrl }, `Page ${currentPageNumber}/${pageTotalAmount}`);

				const nextPageNumber = getPageNumber(requestObject.baseWebsiteUrl, data.Pagination.nextPage); // stockx nextPage url doesnt work, thats why need to append next page param manually
				currentPageNumber = nextPageNumber;
				currentAPIUrl = appendNextPageParam(nextPageNumber, currentAPIUrl);

				await timoutPromise().then(res => console.log(res));
			} while (currentAPIUrl);
		} catch (e: unknown) {
			if (e instanceof Error) {
				logger.error({ err: e, currentAPIUrl, content });
			}
		}
	}
})();
