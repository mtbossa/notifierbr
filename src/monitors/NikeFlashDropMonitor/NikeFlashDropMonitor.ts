import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs } from '../../helpers/general';
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
			this._discordClient.emit('flashDrop', this._discordClient, newSneakers);
		}

		this.reRun();
	}
}
