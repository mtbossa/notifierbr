import logger from '../logger';
import { NikeFlashDropRepositoryInterface } from '../repositories/NikeFlashDropRepositoryInterface';

export abstract class Monitor {
	abstract checkTimeout: number; //

	abstract check(): void;

	public start(): void {
		this.check();
	}

	protected reRun(): void {
		setTimeout(this.check.bind(this), this.checkTimeout);
	}
}
