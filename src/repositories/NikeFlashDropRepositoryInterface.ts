import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeAPIRequestData } from '../monitors/NikeFlashDropMonitorTest';

export interface NikeFlashDropRepositoryInterface {
	sourceToFindData: NikeAPIRequestData;

	getNewSneakers(): Promise<SneakerData[]>;
}
