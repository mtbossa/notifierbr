import moment from 'moment';
import { log } from '../helpers/general';
import { SneakerData } from '../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../prismaClient';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';

export class NikeFlashDropsMonitorService {
	private _today = moment();

	private _isDateToday(date: string): boolean {
		const snkeakerCreatedDate = moment(date, 'YYYY-MM-DD hh:mm:ss');
		return moment(this._today.format('YYYY-MM-DD')).isSame(snkeakerCreatedDate.format('YYYY-MM-DD'));
	}

	public async filterUniqueSneakers(products: Product[]) {
		let newSneakers: Product[] = [];

		for (const product of products) {
			const foundProduct = await prismaClient.product.findUnique({ where: { name: product.name } });
			if (!foundProduct) {
				newSneakers = [...newSneakers, product];
				await prismaClient.product.create({ data: { name: product.name } });
			}
		}

		return newSneakers;
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
