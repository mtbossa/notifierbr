import axios, { AxiosRequestConfig } from 'axios';
import { log } from '../../helpers/general';
import logger from '../../logger';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../../prismaClient';
import { NikeFlashDropAPIRequestData } from '../../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';
import { Product } from '../../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { NikeFlashDropRepositoryInterface } from '../NikeFlashDropRepositoryInterface';
export class NikeFlashDropsAPIRepository implements NikeFlashDropRepositoryInterface {
	constructor(
		public sourceToFindData: NikeFlashDropAPIRequestData,
		private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService
	) {}

	async getNewSneakers(): Promise<SneakerData[]> {
		let newSneakers: SneakerData[] = [];

		for (const pageSearchRequest of this.sourceToFindData.requests) {
			log('Search page: ', pageSearchRequest.url);
			logger.info({ 'pageSearchRequest.url': pageSearchRequest.url }, 'Quering page');
			const currentPageNewSneakers = await this._currentPageNewSneakers(pageSearchRequest);

			if (currentPageNewSneakers && currentPageNewSneakers.length > 0) {
				const mappedCurrentPageNewSneakers: SneakerData[] = currentPageNewSneakers.map((sneaker: Product) =>
					this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(sneaker)
				);
				newSneakers = [...newSneakers, ...mappedCurrentPageNewSneakers];
			}
		}

		return newSneakers;
	}

	private async _currentPageNewSneakers(pageSearchRequest: AxiosRequestConfig): Promise<Product[] | undefined> {
		try {
			const response = await axios(pageSearchRequest); // this is one page request for the same query search, ex.: tenis air jordan, tenis air jordan page 2
			return await this.filterUniqueSneakers(response.data.productsInfo.products as Product[]);
		} catch (e: unknown) {
			if (e instanceof Error) logger.error({ error: e, pageSearchRequest });
		}
	}

	public async findUniqueProduct(product: Product) {
		try {
			return await prismaClient.product.findUnique({ where: { name: product.name } });
		} catch (e) {
			if (e instanceof Error) logger.error({ error: e, product });
		}
	}

	public async createProduct(productName: string): Promise<void> {
		try {
			const productCreated = await prismaClient.product.create({ data: { name: productName } });
			logger.info({ ProductCreateName: productCreated.name }, 'Product create!');
		} catch (e) {
			if (e instanceof Error) logger.error({ error: e, productName });
		}
	}

	public async filterUniqueSneakers(products: Product[]): Promise<Product[]> {
		let newSneakers: Product[] = [];

		for (const product of products) {
			const foundProduct = await this.findUniqueProduct(product);

			if (!foundProduct) {
				logger.info({ APIProductName: product.name }, 'Product name not found on database, Flash Drop!');
				newSneakers = [...newSneakers, product];
				await this.createProduct(product.name);
			}
		}

		return newSneakers;
	}
}
