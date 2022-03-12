import axios, { AxiosRequestConfig } from 'axios';
import { log } from '../../helpers/general';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { NikeFlashDropAPIRequestData } from '../../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';
import { NikeRestockAPIRequestData } from '../../requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { Product } from '../../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';
import { ProductInfo } from '../../requests/nike/interfaces/responses/NikeSneakerProductResponseInterface';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { NikeRestockMonitorService } from '../../services/NikeRestockMonitorSerivce';
import { NikeRestockRepositoryInterface } from '../NikeRestockRepositoryInterface';
export class NikeRestockAPIRepository
	implements NikeRestockRepositoryInterface
{
	constructor(
		public sourceToFindData: NikeRestockAPIRequestData,
		private _nikeRestockMonitorService: NikeRestockMonitorService
	) {}

	async getSneaker(): Promise<SneakerData> {
		log('search: ', this.sourceToFindData.sneakerName);

		const sneakerData = await this._getSneakerData(
			this.sourceToFindData.request
		);

		const mappedSneakerData =
			this._nikeRestockMonitorService.mapNeededSneakerDataForDiscord({
				productInfo: sneakerData!,
				url: this.sourceToFindData.url,
				imgUrl: this.sourceToFindData.imgUrl,
			});

		console.log('mappedSneakerData: ', mappedSneakerData);

		return mappedSneakerData;
	}

	private async _getSneakerData(
		pageSearchRequest: AxiosRequestConfig
	): Promise<ProductInfo | undefined> {
		try {
			const response = await axios(pageSearchRequest);

			console.log(response.data);

			return response.data.productInfo as ProductInfo;
		} catch (e: unknown) {
			if (e instanceof Error) console.log(e.message);
		}
	}
}