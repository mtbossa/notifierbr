import moment from 'moment';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';

export class NikeFlashDropsMonitorService {
	private _today = moment();

	private _isDateToday(date: string): boolean {
		const snkeakerCreatedDate = moment(date, 'YYYY-MM-DD hh:mm:ss');
		return moment(this._today.format('YYYY-MM-DD')).isSame(
			snkeakerCreatedDate.format('YYYY-MM-DD')
		);
	}

	public filterSneakersCreatedToday(products: Product[]) {
		return products.filter((product: Product) =>
			this._isDateToday(product.created)
		);
	}

	public mapNeededSneakerDataForDiscord(sneaker: Product): SneakerData {
		return {
			name: sneaker.name,
			url: this._removeSlashes(sneaker.productUrl),
			imgUrl: this._removeSlashes(sneaker.imageUrl),
			price: `R$ ${sneaker.price}`,
			discount: sneaker.isDiscount
				? `R$ ${sneaker.discountedPrice}`
				: undefined,
		} as SneakerData;
	}

	private _removeSlashes(string: string) {
		return string.replace('//', 'https://');
	}
}
