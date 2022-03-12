import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { NikeFlashDropsAPIRepository } from '../../repositories/implementations/NikeFlashDropsAPIRepository';
import { NikeFlashDropAPIRequestData } from '../../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import {
	NikeFlashDropsMonitor,
} from './NikeFlashDropMonitor';

export function createNikeFlashDropMonitor(
	config: NikeFlashDropAPIRequestData,
	discordClient: Client
) {
	const nikeFlashDropService = new NikeFlashDropsMonitorService();
	const flashDropRepository = new NikeFlashDropsAPIRepository(
		config,
		nikeFlashDropService
	);

	return new NikeFlashDropsMonitor(flashDropRepository!, discordClient);
}
