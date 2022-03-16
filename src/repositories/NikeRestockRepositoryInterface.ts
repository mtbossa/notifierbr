import { Page } from 'puppeteer';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeRestockAPIRequestData } from '../requests/nike/interfaces/requests/NikeRestockAPIRequestData';

export interface NikeRestockRepositoryInterface {
	getSneaker(requestObject: NikeRestockAPIRequestData): Promise<SneakerData | null>;
	goToSneakerPage(requestObject: NikeRestockAPIRequestData): Promise<void>;
}
