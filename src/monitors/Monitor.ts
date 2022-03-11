import { NikeFlashDropRepositoryInterface } from '../repositories/NikeFlashDropRepositoryInterface';

export abstract class Monitor {
	abstract checkMinutesTimeout: number;

	abstract check(): void;

	public start(): void {
		this.check();
	}

	protected reRun(): void {
		setTimeout(this.check.bind(this), this.checkMinutesTimeout);
	}
}
