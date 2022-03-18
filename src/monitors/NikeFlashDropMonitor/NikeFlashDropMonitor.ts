import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs, secToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeFlashDropRepositoryInterface } from '../../repositories/NikeFlashDropRepositoryInterface';
import { NikeAPISearchRequest } from '../../requests/nike/interfaces/requests/NikeAPISearchRequest';
import { Monitor } from '../Monitor';

export class NikeFlashDropsMonitor extends Monitor {
	public checkTimeout: number = minToMs(1);

	constructor(
		private requestsObjects: NikeAPISearchRequest[],
		protected flashDropRepository: NikeFlashDropRepositoryInterface,
		private _discordClient: Client,
	) {
	  super();
	}

	async check(): Promise<void> {
	  for (const requestObject of this.requestsObjects) {
	    await waitTimeout(secToMs(3), secToMs(10));
	    const newSneakers = await this.flashDropRepository.getNewSneakersOfThisSearch(requestObject);

	    if (newSneakers.length > 0) {
	      logger.info({ newSneakers }, 'New Sneakers found', 'NikeFlashDropMonitor.check()');
	      this._discordClient.emit('flashDrop', this._discordClient, newSneakers);
	    }
	  }

	  this.reRun();
	}
}
