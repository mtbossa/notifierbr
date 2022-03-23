import { Client } from 'discord.js';
import { NikeFlashDropsAPIRepository } from '../repositories/implementations/NikeFlashDropsAPIRepository';
import { NikeAPISearchRequest } from '../models/requests/NikeAPISearchRequest';
import { NikeFlashDropsMonitorService } from '../services/NikeFlashDropMonitorService';
import { NikeFlashDropsMonitor } from './NikeFlashDropMonitor';

export function createNikeFlashDropMonitor(discordClient: Client) {
  const requestsObjects: NikeAPISearchRequest[] = require('../../../../scrape_data/monitors/Nike/searchs.json'); // array with axios formatted request for nike sneakers search

  const nikeFlashDropService = new NikeFlashDropsMonitorService();
  const flashDropRepository = new NikeFlashDropsAPIRepository(
    nikeFlashDropService
  );

  return new NikeFlashDropsMonitor(
    requestsObjects,
    flashDropRepository!,
    nikeFlashDropService,
    discordClient
  );
}
