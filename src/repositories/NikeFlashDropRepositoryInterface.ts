import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeAPISearchRequest } from '../requests/nike/interfaces/requests/NikeAPISearchRequest';

export interface NikeFlashDropRepositoryInterface {
	getNewSneakersOfThisSearch(requestObject: NikeAPISearchRequest): Promise<SneakerData[]>;
}
