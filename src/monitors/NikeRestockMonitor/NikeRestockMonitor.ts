import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeRestockRepositoryInterface } from '../../repositories/NikeRestockRepositoryInterface';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { Monitor } from '../Monitor';

export class NikeRestockMonitor extends Monitor {
	public checkMinutesTimeout: number = minToMs(0.3);

	constructor(
		protected requestsObjects: NikeRestockAPIRequestData[],
		protected restockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client
	) {
		super();
	}

	async check(): Promise<void> {
		for (const requestObject of this.requestsObjects) {
			const sneaker = await this.restockRepository.getSneaker(requestObject);

			if (sneaker && sneaker.available) {
				this._discordClient.emit('restock', this._discordClient, sneaker);
			}
		}
		logger.info('Passed all requestObjets, waiting to rerun...');
		this.reRun();
	}
}
