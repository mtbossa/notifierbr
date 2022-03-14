import moment from 'moment';
import logger from '../logger';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../prismaClient';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';

export class NikeFlashDropsMonitorService {
	public mapNeededSneakerDataForDiscord(sneaker: Product): SneakerData {
		return {
			name: sneaker.name,
			url: this._removeSlashes(sneaker.productUrl),
			imgUrl: this._removeSlashes(sneaker.imageUrl),
			price: `R$ ${sneaker.price}`,
			discount: sneaker.isDiscount ? `R$ ${sneaker.discountedPrice}` : undefined,
		} as SneakerData;
	}

	private _removeSlashes(string: string) {
		return string.replace('//', 'https://');
	}
}
