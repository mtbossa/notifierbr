import { PrismaClient } from '@prisma/client';
import { StockxAPIRequestData } from '../requests/nike/interfaces/requests/StockxAPIRequestData';
import puppeteer from 'puppeteer-extra';
import { StockxResponse } from '../requests/nike/interfaces/responses/StockxResponseInterface';
import logger from '../logger';
import { log } from '../helpers/general';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import fs from 'fs';

(async () => {
	const prismaClient = new PrismaClient();
	const requestsObjects: StockxAPIRequestData[] = require('../../requests/nike/stockx-nike-requests.json');

	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	const userAgent = new UserAgent({ deviceCategory: 'desktop' });

	let nextPage: number | boolean | null | string = 1;
	for (const requestObject of requestsObjects) {
		try {
			do {
				await page.setUserAgent(userAgent.random().toString());
				log(requestObject.request.url!);
				await page.goto(requestObject.request.url!);
				await page.content();

				const data: StockxResponse = await page.evaluate(() => {
					return JSON.parse(document.querySelector('body')!.innerText);
				});
				nextPage = new URL(`${requestObject.url}${data.Pagination.nextPage}`).searchParams.get('page');

				requestObject.request = {
					...requestObject.request,
					url: `${requestObject.baseUrl}&page=${nextPage}`,
				};

				const products = data.Products;
				for (const product of products) {
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
					logger.info({ newProduct }, 'Product created');
				}
				console.log('nextPage before while: ', nextPage);
			} while (nextPage);
		} catch (e: unknown) {
			if (e instanceof Error) {
				logger.error({ err: e, nextPage });
				nextPage = false;
			}
		}
	}
})();
