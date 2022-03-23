import logger from '../logger';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeAPISearchRequest } from '../requests/nike/interfaces/requests/NikeAPISearchRequest';
import { Product } from '../requests/nike/interfaces/responses/NikeAPISearchResponse';

export abstract class NikeFlashDropRepositoryInterface {
	protected log = logger.child({ monitor: '[NikeFlashDropMonitor]' });

	abstract getNewSneakersOfThisSearch(requestObject: NikeAPISearchRequest): Promise<SneakerData[]>;

	abstract getCurrentSearchSneakersData(requestObject: NikeAPISearchRequest): Promise<Product[]>;

	abstract filterUniqueSneakers(products: Product[]): Promise<Product[]>;
}
