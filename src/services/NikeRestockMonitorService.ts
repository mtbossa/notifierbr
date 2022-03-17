import { SneakerData } from '../models/interfaces/SneakerDataInterface';

export class NikeRestockMonitorService {
	public mapNeededSneakerDataForDiscord(sneakerData: {
		name: string;
		url: string;
		imgUrl: string;
	}): SneakerData {
		return {
			name: sneakerData.name,
			url: sneakerData.url,
			imgUrl: sneakerData.imgUrl,
		} as SneakerData;
	}
}
