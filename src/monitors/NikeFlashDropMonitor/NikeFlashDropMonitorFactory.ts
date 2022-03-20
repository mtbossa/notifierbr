import { Client } from 'discord.js';
import { NikeFlashDropsAPIRepository } from '../../repositories/implementations/NikeFlashDropsAPIRepository';
import { NikeAPISearchRequest } from '../../requests/nike/interfaces/requests/NikeAPISearchRequest';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { CurrentResultsStylesCodeFromAllSearchs } from './interfaces/CurrentResultsStylesCodeFromAllSearchsInterface';
import { NikeFlashDropsMonitor } from './NikeFlashDropMonitor';

export function createNikeFlashDropMonitor(discordClient: Client) {
	const requestsObjects: NikeAPISearchRequest[] = require('../../../requests/nike/nike-flash-drop-requests.json'); // array with axios formatted request for nike sneakers search
	const currentStylesCodeFromAllSearchs: CurrentResultsStylesCodeFromAllSearchs = require('../../../control_files/Nike/NikeFlashDropMonitor/current-results-styles-code-from-all-searchs.json'); // array with axios formatted request for nike sneakers search

	const nikeFlashDropService = new NikeFlashDropsMonitorService();
	const flashDropRepository = new NikeFlashDropsAPIRepository(nikeFlashDropService);

	return new NikeFlashDropsMonitor(
		requestsObjects,
		currentStylesCodeFromAllSearchs,
		flashDropRepository!,
		nikeFlashDropService,
		discordClient
	);
}
