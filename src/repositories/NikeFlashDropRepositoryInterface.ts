import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeFlashDropAPIRequestData } from '../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';

export interface NikeFlashDropRepositoryInterface {
	sourceToFindData: NikeFlashDropAPIRequestData;

	getNewSneakers(): Promise<SneakerData[]>;
}
