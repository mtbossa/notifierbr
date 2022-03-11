import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { NikeFlashDropsAPIRepository } from '../repositories/implementations/NikeFlashDropsAPIRepository';
import { NikeFlashDropsMonitorService } from '../services/NikeFlashDropMonitorSerivce';
import {
	NikeAPIRequestData,
	NikeFlashDropsMonitorTest,
} from './NikeFlashDropMonitorTest';

export function createNikeFlashDropMonitor(
	config: NikeAPIRequestData,
	discordClient: Client
) {
	const nikeFlashDropService = new NikeFlashDropsMonitorService();
	const flashDropRepository = new NikeFlashDropsAPIRepository(
		config,
		nikeFlashDropService
	);

	return new NikeFlashDropsMonitorTest(flashDropRepository!, discordClient);
}
