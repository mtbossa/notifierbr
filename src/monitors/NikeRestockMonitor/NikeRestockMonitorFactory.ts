import { Client } from 'discord.js';
import { NikeRestockPuppeteerAPIRepository } from '../../repositories/implementations/NikeRestockPuppeteerAPIRepository';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorSerivce';
import { NikeRestockMonitor } from './NikeRestockMonitor';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';

export async function createRestockDropMonitor(discordClient: Client) {
	const requestsObjects: NikeRestockAPIRequestData[] = require('../../../requests/nike/nike-restock-requests.json');
	const nikeRestockMonitorService = new NikeRestockMonitorService();

	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();
	const userAgent = new UserAgent({ deviceCategory: 'desktop' });

	const restockRepository = new NikeRestockPuppeteerAPIRepository(nikeRestockMonitorService, browser, page, userAgent);

	return new NikeRestockMonitor(requestsObjects, restockRepository!, discordClient);
}
