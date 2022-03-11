import axios, { AxiosRequestConfig } from 'axios';
import { log } from '../../helpers/general';
import { NikeAPIRequestData } from '../../monitors/NikeFlashDropMonitorTest';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorSerivce';
import { NikeFlashDropRepositoryInterface } from '../NikeFlashDropRepositoryInterface';

export interface CollectInfo {
	skuList: any[];
	productId: string;
}

export interface Spec {
	size: string;
	color: string;
}

export interface Image {
	'260-x-260': string;
	'310-x-310': string;
	'380-x-380': string;
	'440-x-440': string;
	'50-x-50': string;
	'800-x-800': string;
	default: string;
}

export interface Installment {
	count: number;
	price: number;
}

export interface Detail {
	colorReference: string;
	'550-x-550': string;
	'50-x-50': string;
	flags: string[];
	specsSizeOrder: number;
	sizeAndOrder: string;
}

export interface Tag {
	id: string;
	name: string;
	parents: any[];
}

export interface Property {
	images: Image;
	oldPrice: number;
	price: number;
	installment: Installment;
	name: string;
	details: Detail;
	stock: number;
	url: string;
	status: string;
	tags: Tag[];
}

export interface Sku {
	sku: string;
	specs: Spec;
	properties: Property;
}

export interface Installment {
	amount: string;
	qty: number;
	amountRaw: string;
}

export interface Image {
	'260-x-260': string;
	'310-x-310': string;
	'380-x-380': string;
	'440-x-440': string;
	'50-x-50': string;
	'800-x-800': string;
	default: string;
}

export interface Tag {
	id: string;
	name: string;
}

export interface Category {
	id: string;
	name: string;
	parents: any[];
	used: boolean;
}

export interface ExtraAttribute {
	categoriaDeProduto: string[];
	esporte: string[];
	skuReference: string[];
	marcas: string[];
	alturaDoCano: string[];
	tipoDeProduto: string[];
	gênero: string[];
	shortDescription: string[];
	salesChannel: string[];
	categoryName: string[];
}

export interface Product {
	name: string;
	isAvailable: number;
	originalId: string;
	imageUrl: string;
	productUrl: string;
	ranking: number;
	discountedPrice: string;
	discountedPriceRaw: string;
	categoryId: string;
	categoryName: string;
	collectInfo: CollectInfo;
	price: string;
	priceRaw: string;
	skus: Sku[];
	description: string;
	clickUrl: string;
	installments: Installment[];
	images: Image;
	created: string;
	tags: Tag[];
	categories: Category[];
	specs: Spec;
	isDiscount: boolean;
	extraAttributes: ExtraAttribute;
	subtitle: string;
}

export interface SneakerData {
	name: string;
	url: string;
	imgUrl: string;
	price: string;
	discount?: string;
}

export class NikeFlashDropsAPIRepository
	implements NikeFlashDropRepositoryInterface
{
	constructor(
		public sourceToFindData: NikeAPIRequestData,
		private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService
	) {}

	async getNewSneakers(): Promise<SneakerData[]> {
		let newSneakers: SneakerData[] = [];

		for (const pageSearchRequest of this.sourceToFindData.requests) {
			log(
				'search: ',
				this.sourceToFindData.search,
				'url: ',
				pageSearchRequest.url
			);

			const currentPageNewSneakers = await this._currentPageNewSneakers(
				pageSearchRequest
			);

			if (currentPageNewSneakers && currentPageNewSneakers.length > 0) {
				const mappedCurrentPageNewSneakers: SneakerData[] =
					currentPageNewSneakers.map((sneaker: Product) =>
						this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(
							sneaker
						)
					);
				newSneakers = [...newSneakers, ...mappedCurrentPageNewSneakers];
			}
		}

		return newSneakers;
	}

	private async _currentPageNewSneakers(
		pageSearchRequest: AxiosRequestConfig
	): Promise<Product[] | undefined> {
		try {
			const response = await axios(pageSearchRequest); // this is one page request for the same query search, ex.: tenis air jordan, tenis air jordan page 2

			return response.data.productsInfo.products.filter((product: Product) => {
				this._nikeFlashDropMonitorService.isDateToday(product.created);
			});
		} catch (e: unknown) {
			if (e instanceof Error) console.log(e.message);
		}
	}
}
