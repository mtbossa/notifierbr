import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { NikeFlashDropsAPIRepository } from '../../repositories/implementations/NikeFlashDropsAPIRepository';
import { NikeRestockAPIRepository } from '../../repositories/implementations/NikeRestockAPIRepository';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorSerivce';
import { NikeRestockMonitor } from './NikeRestockMonitor';

export function createRestockDropMonitor(
	config: NikeRestockAPIRequestData,
	discordClient: Client
) {
	const nikeRestockMonitorService = new NikeRestockMonitorService();
	const restockRepository = new NikeRestockAPIRepository(
		config,
		nikeRestockMonitorService
	);

	return new NikeRestockMonitor(restockRepository!, discordClient);
}
