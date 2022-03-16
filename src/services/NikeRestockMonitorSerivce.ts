import moment from 'moment';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';
import { ProductInfo } from '../requests/nike/interfaces/responses/NikeSneakerProductResponseInterface';

export class NikeRestockMonitorService {
	public mapNeededSneakerDataForDiscord(sneakerData: {
		productInfo: ProductInfo;
		name: string;
		url: string;
		imgUrl: string;
	}): SneakerData {
		return {
			name: sneakerData.name,
			url: sneakerData.url,
			imgUrl: sneakerData.imgUrl,
			price: `R$ ${sneakerData.productInfo.salePrice}`.replace('.', ','),
			available: sneakerData.productInfo.availability === 'no' ? false : true,
		} as SneakerData;
	}
}
