import { Logger } from 'pino';
import { msToSec, randomIntFromInterval } from '../helpers/general';
import logger from '../logger';
import { NikeFlashDropRepositoryInterface } from '../repositories/NikeFlashDropRepositoryInterface';

export abstract class Monitor {
	protected abstract minTimeout: number;

	protected abstract maxTimeout: number;

	protected log = logger.child({ monitor: `[${this.constructor.name}]` });

	abstract check(): void;

	public start(): void {
	  this.check();
	}

	protected reRunCheck(): void {
	  const randomInterval = randomIntFromInterval(this.minTimeout, this.maxTimeout);
	  this.log.info(`Waiting ${msToSec(randomInterval)}sec to reRunCheck ${this.constructor.name}`);
	  setTimeout(this.check.bind(this), randomInterval);
	}
}
