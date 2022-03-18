import { Client } from 'discord.js';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorService';
import { NikeRestockMonitor } from './NikeRestockMonitor';
import { NikeRestockPuppeteerScrapeRepository } from '../../repositories/implementations/NikeRestockPuppeteerScrapeRepository';

export async function createRestockDropMonitor(discordClient: Client) {
  const requestsObjects: NikeRestockAPIRequestData[] = require('../../../requests/nike/nike-restock-requests.json');
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  const nikeRestockMonitorService = new NikeRestockMonitorService();
  const restockRepository = new NikeRestockPuppeteerScrapeRepository(
    nikeRestockMonitorService,
    userAgent,
  );
  const nikeRestockMonitor = await (new NikeRestockMonitor(requestsObjects, restockRepository!, discordClient)).setUpPuppeteer();

  return nikeRestockMonitor;
}
