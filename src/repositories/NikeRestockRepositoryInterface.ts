import { Page } from 'puppeteer';
import logger from '../logger';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeRestockAPIRequestData } from '../requests/nike/interfaces/requests/NikeRestockAPIRequestData';

export abstract class NikeRestockRepositoryInterface {
	protected log = logger.child({ monitor: `[NikeRestockMonitor]` });
	abstract isSneakerAvailable(requestObject: NikeRestockAPIRequestData, page: Page): Promise<boolean>;
	abstract getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData>;
}
