import axios, { AxiosRequestConfig } from "axios";
import { secToMs, waitTimeout } from "../../../../helpers/general";
import { DiscordSneakerData } from "../../../../discord-bot/models/interfaces/DiscordSneakerData";
import prismaClient from "../../../../prismaClient";
import { NikeAPISearchRequest } from "../../models/requests/NikeAPISearchRequest";
import {
  NikeAPISearchResponse,
  Pagination,
  Product,
} from "../../models/responses/NikeAPISearchResponse";
import NikeFlashDropsMonitorService from "../../services/NikeFlashDropMonitorService";
import NikeFlashDropRepositoryInterface from "../NikeFlashDropRepositoryInterface";

export default class NikeFlashDropsAPIRepository extends NikeFlashDropRepositoryInterface {
  private _currentPage?: number;

  private _currentRequest?: AxiosRequestConfig;

  private _maxPages?: number;

  private _baseAPIUrl?: string;

  private _baseAPIReferer?: string;

  private _search?: string;

  constructor(private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService) {
    super();
  }

  private _setInitialConfig(requestObject: NikeAPISearchRequest) {
    this._search = requestObject.search;
    this._currentPage = 1;
    this._currentRequest = requestObject.request;
    this._baseAPIUrl = requestObject.request.url!;
    this._baseAPIReferer = requestObject.request.headers!.Referer as string;
  }

  public async getCurrentSearchSneakersData(requestObject: NikeAPISearchRequest) {
    this._setInitialConfig(requestObject);

    let sneakersData: Product[] = [];

    do {
      await waitTimeout({ min: secToMs(2), max: secToMs(5) });

      const currentPageSneakers = await this._getCurrentSearchPageSneakers(this._currentRequest!);

      if (!currentPageSneakers) {
        continue;
      }

      sneakersData = [...sneakersData, ...currentPageSneakers];
    } while (this._currentPage! <= this._maxPages!);

    return sneakersData;
  }

  async getNewSneakersOfThisSearch(
    requestObject: NikeAPISearchRequest,
  ): Promise<DiscordSneakerData[]> {
    this._setInitialConfig(requestObject);

    let newUniqueSneakers: DiscordSneakerData[] = [];
    do {
      await waitTimeout({ min: secToMs(2), max: secToMs(5) });

      const currentPageSneakers = await this._currentPageDesiredSneakers(this._currentRequest!);

      if (!currentPageSneakers) {
        continue;
      }

      const currentPageNewUniqueSneakers = await this.filterUniqueSneakers(currentPageSneakers);

      if (currentPageNewUniqueSneakers && currentPageNewUniqueSneakers.length > 0) {
        const mappedCurrentPageNewUniqueSneakers: DiscordSneakerData[] =
          currentPageNewUniqueSneakers.map((sneaker: Product) =>
            this._nikeFlashDropMonitorService.mapNeededDiscordSneakerDataForDiscord(sneaker),
          );
        newUniqueSneakers = [...newUniqueSneakers, ...mappedCurrentPageNewUniqueSneakers];
      }
    } while (this._currentPage! <= this._maxPages!);

    return newUniqueSneakers;
  }

  private _firstRequest() {
    return this._currentPage === 1;
  }

  private _updateCurrentRequest(pageSearchRequest: AxiosRequestConfig, pagination: Pagination) {
    const nextAPIUrl = new URL(pageSearchRequest.url!);
    const nextAPIUrlSearchParams = nextAPIUrl.searchParams;
    const nextAPIRefererUrl = new URL(this._baseAPIReferer!);
    const nextRefererUrlSearchParams = nextAPIRefererUrl.searchParams;
    let appendOrSet: keyof URLSearchParams = "set";

    if (this._firstRequest()) {
      this._maxPages = pagination.numberOfPages; // Get max pages on first request
      appendOrSet = "append";
    }

    this.log.info(
      `[ Search => ${this._search} ] - [ Page => ${this._currentPage}/${this._maxPages} ] - [ URL => ${pageSearchRequest.url} ]`,
    );

    this._currentPage! += 1;

    nextAPIUrlSearchParams[appendOrSet]("page", String(this._currentPage));
    nextRefererUrlSearchParams[appendOrSet]("page", String(this._currentPage));

    const newHeader = {
      headers: {
        ...this._currentRequest?.headers,
        Referer: nextAPIRefererUrl.toString(),
      },
    };

    this._currentRequest = {
      ...this._currentRequest,
      url: nextAPIUrl.toString(),
      ...newHeader,
    };
  }

  private async _getCurrentSearchPageSneakers(
    pageSearchRequest: AxiosRequestConfig,
  ): Promise<Product[]> {
    try {
      const response = await axios(pageSearchRequest);
      const nikeResponse: NikeAPISearchResponse = response.data;
      const { pagination } = nikeResponse;
      const { products } = nikeResponse.productsInfo;

      this._updateCurrentRequest(pageSearchRequest, pagination);

      if (!products) {
        throw new Error("Nike response had products empty!");
      }

      return products;
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
          errorMsg: e.message,
          pageSearchRequest,
        });
      }
      return [];
    }
  }

  private async _currentPageDesiredSneakers(
    pageSearchRequest: AxiosRequestConfig,
  ): Promise<Product[]> {
    try {
      this.log.info(`Current page search URL: ${pageSearchRequest.url}`);
      const response = await axios(pageSearchRequest);
      const nikeResponse: NikeAPISearchResponse = response.data;
      const { pagination } = nikeResponse;
      const { products } = nikeResponse.productsInfo;

      if (!products) {
        this.log.error({ responseData: response.data }, "Nike response had products empty!");
      }
      this._updateCurrentRequest(pageSearchRequest, pagination);

      const onlyDesiredSneakers = products
        ? this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(products)
        : [];

      return onlyDesiredSneakers;
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
          errorMsg: e.message,
          method: "NikeFlashDropAPIRespository._currentPageNewSneakers",
          pageSearchRequest,
        });
      }
      return [];
    }
  }

  public async findUniqueProduct(styleCode: string) {
    try {
      return await prismaClient.product.findUnique({
        where: { style_code: styleCode },
      });
    } catch (e) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
          errorMsg: e.message,
          method: "NikeFlashDropAPIRespository.findUniqueProduct",
          styleCode,
        });
      }

      return [];
    }
  }

  public async createProduct(productInfo: {
    productName: string;
    styleCode: string;
    brand: string;
    productUrl: string;
    releaseDate?: string;
  }): Promise<void> {
    try {
      const nikeStore = await prismaClient.store.findUnique({
        where: { url: "https://www.nike.com.br" },
      });
      if (!nikeStore) throw new Error("Store not found");
      const productCreated = await prismaClient.product.create({
        data: {
          name: productInfo.productName,
          brand: productInfo.brand,
          style_code: productInfo.styleCode,
          release_date: productInfo.releaseDate,
          stores: {
            create: {
              stores_id: nikeStore?.id,
              product_url: this._nikeFlashDropMonitorService.changeUrlSlashesToHttps(
                productInfo.productUrl,
              ),
              available: true,
            },
          },
        },
      });
      this.log.info({ ProductCreateName: productCreated.name }, "Product create!");
    } catch (e) {
      if (e instanceof Error) {
        this.log.error({
          err: e,
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
        this.log.info(
          { APIProductName: product.name },
          "Product name not found on database, Flash Drop!",
        );
        newSneakers = [...newSneakers, product];
        await this.createProduct({
          productName: product.name,
          styleCode,
          brand: "Nike",
          productUrl: product.productUrl,
        });
      }
    }

    return newSneakers;
  }
}
