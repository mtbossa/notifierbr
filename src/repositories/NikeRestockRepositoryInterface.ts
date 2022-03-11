import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { NikeRestockAPIRequestData } from '../requests/nike/interfaces/requests/NikeRestockAPIRequestData';

export interface NikeRestockRepositoryInterface {
	sourceToFindData: NikeRestockAPIRequestData;

	getSneaker(): Promise<SneakerData>;
}
