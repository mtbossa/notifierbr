import { Client } from 'discord.js';
import { minToMs, secToMs } from '../../helpers/general';
import logger from '../../logger';
import { NikeRestockRepositoryInterface } from '../../repositories/NikeRestockRepositoryInterface';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { Monitor } from '../Monitor';

export class NikeRestockMonitor extends Monitor {
	public checkTimeout: number = secToMs(10);

	constructor(
		protected requestsObjects: NikeRestockAPIRequestData[],
		protected restockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client
	) {
		super();
	}

	async check(): Promise<void> {
		for (const requestObject of this.requestsObjects) {
			const isSneakerAvailable = await this.restockRepository.isSneakerAvailable(requestObject.url);
			if(!isSneakerAvailable) continue;

			const sneaker = await this.restockRepository.getSneaker(requestObject);
			this._discordClient.emit('restock', this._discordClient, sneaker);
		}
		logger.info(`Passed all requestObjets, waiting ${this.checkTimeout}ms to rerun...`);
		this.reRun();
	}
}
