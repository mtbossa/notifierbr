import axios, { AxiosRequestConfig } from 'axios';
import { log } from '../../helpers/general';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { NikeFlashDropAPIRequestData } from '../../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';
import { Product } from '../../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { NikeFlashDropRepositoryInterface } from '../NikeFlashDropRepositoryInterface';
export class NikeFlashDropsAPIRepository
	implements NikeFlashDropRepositoryInterface
{
	constructor(
		public sourceToFindData: NikeFlashDropAPIRequestData,
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

			return this._nikeFlashDropMonitorService.filterSneakersCreatedToday(
				response.data.productsInfo.products as Product[]
			);
		} catch (e: unknown) {
			if (e instanceof Error) console.log(e.message);
		}
	}
}
