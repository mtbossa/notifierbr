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
			logger.info({ 'pageSearchRequest.url': pageSearchRequest.url }, 'Querying page');
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
			const onlyDesiredSneakers = this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(
				response.data.productsInfo.products as Product[]
			);

			return await this.filterUniqueSneakers(onlyDesiredSneakers);
		} catch (e: unknown) {
			if (e instanceof Error)
				logger.error({
					err: e,
					errorMsg: e.message,
					method: 'NikeFlashDropAPIRespository._currentPageNewSneakers',
					pageSearchRequest,
				});
		}
	}

	public async findUniqueProduct(styleCode: string) {
		try {
			return await prismaClient.product.findUnique({ where: { style_code: styleCode } });
		} catch (e) {
			if (e instanceof Error)
				logger.error({
					err: e,
					errorMsg: e.message,
					method: 'NikeFlashDropAPIRespository.findUniqueProduct',
					styleCode,
				});
		}
	}

	public async createProduct(productInfo: {
		productName: string;
		styleCode: string;
		brand: string;
		releaseDate?: string;
	}): Promise<void> {
		try {
			const productCreated = await prismaClient.product.create({
				data: {
					name: productInfo.productName,
					brand: productInfo.brand,
					style_code: productInfo.styleCode,
					release_date: productInfo.releaseDate,
				},
			});
			logger.info({ ProductCreateName: productCreated.name }, 'Product create!');
		} catch (e) {
			if (e instanceof Error)
				logger.error({
					err: e,
					errorMsg: e.message,
					method: 'NikeFlashDropAPIRespository.createProduct',
					productInfo,
				});
		}
	}

	public async filterUniqueSneakers(products: Product[]): Promise<Product[]> {
		let newSneakers: Product[] = [];

		for (const product of products) {
			const styleCode = product.extraAttributes.skuReference[0];
			const foundProduct = await this.findUniqueProduct(styleCode);

			if (!foundProduct) {
				logger.info({ APIProductName: product.name }, 'Product name not found on database, Flash Drop!');
				newSneakers = [...newSneakers, product];
				await this.createProduct({ productName: product.name, styleCode: styleCode, brand: 'Nike' });
			}
		}

		return newSneakers;
	}
}
