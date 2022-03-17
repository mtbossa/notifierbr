import { Client } from 'discord.js';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorService';
import { NikeRestockMonitor } from './NikeRestockMonitor';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';
import { NikeRestockPuppeteerScrapeRepository } from '../../repositories/implementations/NikeRestockPuppeteerScrapeRepository';

export async function createRestockDropMonitor(discordClient: Client) {
	const requestsObjects: NikeRestockAPIRequestData[] = require('../../../requests/nike/nike-restock-requests.json');
	const nikeRestockMonitorService = new NikeRestockMonitorService();

	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	const userAgent = new UserAgent({ deviceCategory: 'desktop' });

	const restockRepository = new NikeRestockPuppeteerScrapeRepository(nikeRestockMonitorService, browser, page, userAgent);

	return new NikeRestockMonitor(requestsObjects, restockRepository!, discordClient);
}
