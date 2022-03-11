import { AxiosRequestConfig } from 'axios';
import { Client } from 'discord.js';
import { minToMs } from '../../helpers/general';
import { NikeRestockRepositoryInterface } from '../../repositories/NikeRestockRepositoryInterface';
import { Monitor } from '../Monitor';

export class NikeRestockMonitor extends Monitor {
	public checkMinutesTimeout: number = minToMs(1);

	constructor(
		protected restockRepository: NikeRestockRepositoryInterface,
		private _discordClient: Client
	) {
		super();
	}

	async check(): Promise<void> {
		const sneaker = await this.restockRepository.getSneaker();

		if (sneaker.available) {
			this._discordClient.emit('', this._discordClient, sneaker);
		}

		this.reRun();
	}
}
