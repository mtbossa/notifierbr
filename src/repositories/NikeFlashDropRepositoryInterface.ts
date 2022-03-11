import { AxiosRequestConfig } from 'axios';
import { NikeAPIRequestData } from '../monitors/NikeFlashDropMonitorTest';
import { SneakerData } from './implementations/NikeFlashDropsAPIRepository';

export interface NikeFlashDropRepositoryInterface {
	sourceToFindData: NikeAPIRequestData;

	getNewSneakers(): Promise<SneakerData[]>;
}
