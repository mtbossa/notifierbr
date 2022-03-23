import { Client } from 'discord.js';
import UserAgent from 'user-agents';
import { NikeRestockAPIRequestData } from '../models/requests/NikeRestockAPIRequestData';
import { NikeRestockMonitorService } from '../services/NikeRestockMonitorService';
import { NikeRestockMonitor } from './NikeRestockMonitor';
import { NikeRestockPuppeteerScrapeRepository } from '../repositories/implementations/NikeRestockPuppeteerScrapeRepository';

export async function createRestockDropMonitor(discordClient: Client) {
  const requestsObjects: NikeRestockAPIRequestData[] = require('../../../../scrape_data/monitors/Nike/restocks.json');
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  const nikeRestockMonitorService = new NikeRestockMonitorService();
  const restockRepository = new NikeRestockPuppeteerScrapeRepository(
    nikeRestockMonitorService,
    userAgent
  );
  const nikeRestockMonitor = await new NikeRestockMonitor(
    requestsObjects,
    restockRepository!,
    discordClient
  ).setUpPuppeteer();

  return nikeRestockMonitor;
}
