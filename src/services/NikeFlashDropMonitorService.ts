import moment from 'moment';
import logger from '../logger';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../prismaClient';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';

export class NikeFlashDropsMonitorService {
	private _sneakersNamesToMonitor = [
		'air jordan 1 ',
		'air jordan 4 ',
		'dunk low',
		'dunk high',
		'nike x sacai',
		'sb dunk',
	];

	public filterOnlyDesiredSneakers(products: Product[]): Product[] {
		return products
			.filter(product => {
				// Remove all that we don't want
				return this._sneakersNamesToMonitor.some(nameToMonitor => product.name.toLowerCase().includes(nameToMonitor));
			})
			.filter(product => !product.name.toLowerCase().includes('infantil')); // Removes infantis
	}

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
