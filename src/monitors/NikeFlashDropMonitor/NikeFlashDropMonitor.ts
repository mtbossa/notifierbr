import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs } from '../../helpers/general';
import logger from '../../logger';
import { NikeFlashDropRepositoryInterface } from '../../repositories/NikeFlashDropRepositoryInterface';
import { Monitor } from '../Monitor';

export class NikeFlashDropsMonitor extends Monitor {
	public checkMinutesTimeout: number = minToMs(1);

	constructor(
		protected flashDropRepository: NikeFlashDropRepositoryInterface,
		private _discordClient: Client
	) {
		super();
	}

	async check(): Promise<void> {
		const newSneakers = await this.flashDropRepository.getNewSneakers();

		if (newSneakers.length > 0) {
			logger.info({ newSneakers: newSneakers }, 'New Sneakers found');
			this._discordClient.emit('flashDrop', this._discordClient, newSneakers);
		}

		this.reRun();
	}
}
