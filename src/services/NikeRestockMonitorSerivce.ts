import moment from 'moment';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';
import { ProductInfo } from '../requests/nike/interfaces/responses/NikeSneakerProductResponseInterface';

export class NikeRestockMonitorService {
	public mapNeededSneakerDataForDiscord(sneakerData: {
		productInfo: ProductInfo;
		url: string;
		imgUrl: string;
	}): SneakerData {
		return {
			name: sneakerData.productInfo.name,
			url: sneakerData.url,
			imgUrl: sneakerData.imgUrl,
			price: `R$ ${sneakerData.productInfo.salePrice}`,
			available: sneakerData.productInfo.availability === 'no' ? false : true,
		} as SneakerData;
	}
}
