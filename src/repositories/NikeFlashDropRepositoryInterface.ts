import logger from '../logger';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeAPISearchRequest } from '../requests/nike/interfaces/requests/NikeAPISearchRequest';

export abstract class NikeFlashDropRepositoryInterface {
	protected log = logger.child({ monitor: `[NikeFlashDropMonitor]` });
	abstract getNewSneakersOfThisSearch(requestObject: NikeAPISearchRequest): Promise<SneakerData[]>;
}
