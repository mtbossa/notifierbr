import { Page } from 'puppeteer';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeRestockAPIRequestData } from '../requests/nike/interfaces/requests/NikeRestockAPIRequestData';

export interface NikeRestockRepositoryInterface {
	isSneakerAvailable(requestObject: NikeRestockAPIRequestData, page: Page): Promise<boolean>;
	getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData>;
}
