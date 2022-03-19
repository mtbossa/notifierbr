import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs, secToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeFlashDropRepositoryInterface } from '../../repositories/NikeFlashDropRepositoryInterface';
import { NikeAPISearchRequest } from '../../requests/nike/interfaces/requests/NikeAPISearchRequest';
import { Monitor } from '../Monitor';

export class NikeFlashDropsMonitor extends Monitor {
	protected minTimeout: number = secToMs(10);
	protected maxTimeout: number = secToMs(60);

	constructor(
		private requestsObjects: NikeAPISearchRequest[],
		protected flashDropRepository: NikeFlashDropRepositoryInterface,
		private _discordClient: Client
	) {
		super();
	}

	async check(): Promise<void> {
		for (const requestObject of this.requestsObjects) {
			await waitTimeout({ min: secToMs(3), max: secToMs(10) });
			this.log.info(`Getting search sneakers: ${requestObject.search}`);
			const newSneakers = await this.flashDropRepository.getNewSneakersOfThisSearch(requestObject);

			if (newSneakers.length > 0) {
				this.log.info({ newSneakers }, 'New Sneakers found', 'NikeFlashDropMonitor.check()');
				this._discordClient.emit('flashDrop', this._discordClient, newSneakers);
			}
		}

		this.reRunCheck();
	}
}
