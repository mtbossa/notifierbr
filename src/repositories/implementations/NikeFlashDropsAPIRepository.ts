import axios, { AxiosRequestConfig } from 'axios';
import { log, secToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../../prismaClient';
import { NikeAPISearchRequest } from '../../requests/nike/interfaces/requests/NikeAPISearchRequest';
import {
  NikeAPISearchResponse,
  Pagination,
  Product,
} from '../../requests/nike/interfaces/responses/NikeAPISearchResponse';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { NikeFlashDropRepositoryInterface } from '../NikeFlashDropRepositoryInterface';

export class NikeFlashDropsAPIRepository implements NikeFlashDropRepositoryInterface {
	private _currentPage?: number;

	private _currentRequest?: AxiosRequestConfig;

	private _maxPages?: number;

	private _baseAPIUrl?: string;

	private _baseAPIReferer?: string;

	constructor(private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService) {}

	private _setInitialConfig(requestObject: NikeAPISearchRequest) {
	  this._currentPage = 1;
	  this._currentRequest = requestObject.request;
	  this._baseAPIUrl = requestObject.request.url!;
	  this._baseAPIReferer = requestObject.request.headers!.Referer as string;
	}

	async getNewSneakersOfThisSearch(requestObject: NikeAPISearchRequest): Promise<SneakerData[]> {
	  this._setInitialConfig(requestObject);

	  let newSneakers: SneakerData[] = [];
	  logger.info(`Getting search sneakers: ${requestObject.search}`);
	  do {
	    await waitTimeout(secToMs(2), secToMs(5));

	    const currentPageNewSneakers = await this._currentPageNewSneakers(this._currentRequest!);

	    if (currentPageNewSneakers && currentPageNewSneakers.length > 0) {
	      const mappedCurrentPageNewSneakers: SneakerData[] = currentPageNewSneakers.map((sneaker: Product) => this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(sneaker));
	      newSneakers = [...newSneakers, ...mappedCurrentPageNewSneakers];
	    }
	  } while (this._currentPage! <= this._maxPages!);

	  return newSneakers;
	}

	private _firstRequest() {
	  return this._currentPage === 1;
	}

	private _updateCurrentRequest(pageSearchRequest: AxiosRequestConfig, pagination: Pagination) {
	  const nextAPIUrl = new URL(pageSearchRequest.url!);
	  const nextAPIUrlSearchParams = nextAPIUrl.searchParams;
	  const nextAPIRefererUrl = new URL(this._baseAPIReferer!);
	  const nextRefererUrlSearchParams = nextAPIRefererUrl.searchParams;
	  let appendOrSet: (keyof URLSearchParams) = 'set';

	  if (this._firstRequest()) {
	    this._maxPages = pagination.numberOfPages; // Get max pages on first request
	    appendOrSet = 'append';
	  }

	  logger.info(`Current page: ${this._currentPage}/${this._maxPages}`);
		this._currentPage!++;

		nextAPIUrlSearchParams[appendOrSet]('page', String(this._currentPage));
		nextRefererUrlSearchParams[appendOrSet]('page', String(this._currentPage));

		const newHeader = { headers: { ...this._currentRequest?.headers, Referer: nextAPIRefererUrl.toString() } };

		this._currentRequest = { ...this._currentRequest, url: nextAPIUrl.toString(), ...newHeader };
	}

	private async _currentPageNewSneakers(pageSearchRequest: AxiosRequestConfig): Promise<Product[] | undefined> {
	  try {
	    logger.info(`Current page search URL: ${pageSearchRequest.url}`);
	    const response = await axios(pageSearchRequest);
	    const nikeResponse: NikeAPISearchResponse = response.data;
	    const { pagination } = nikeResponse;
	    const { products } = nikeResponse.productsInfo;
	    const onlyDesiredSneakers = this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(products);

	    this._updateCurrentRequest(pageSearchRequest, pagination);

	    return await this.filterUniqueSneakers(onlyDesiredSneakers);
	  } catch (e: unknown) {
	    if (e instanceof Error) {
	      logger.error({
	        err: e,
	        errorMsg: e.message,
	        method: 'NikeFlashDropAPIRespository._currentPageNewSneakers',
	        pageSearchRequest,
	      });
	    }
	  }
	}

	public async findUniqueProduct(styleCode: string) {
	  try {
	    return await prismaClient.product.findUnique({ where: { style_code: styleCode } });
	  } catch (e) {
	    if (e instanceof Error) {
	      logger.error({
	        err: e,
	        errorMsg: e.message,
	        method: 'NikeFlashDropAPIRespository.findUniqueProduct',
	        styleCode,
	      });
	    }
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
	    if (e instanceof Error) {
	      logger.error({
	        err: e,
	        errorMsg: e.message,
	        method: 'NikeFlashDropAPIRespository.createProduct',
	        productInfo,
	      });
	    }
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
	      await this.createProduct({ productName: product.name, styleCode, brand: 'Nike' });
	    }
	  }

	  return newSneakers;
	}
}
