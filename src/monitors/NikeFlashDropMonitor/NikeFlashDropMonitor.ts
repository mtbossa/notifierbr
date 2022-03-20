import fs from 'fs';
import { Client } from 'discord.js';
import _ from 'lodash';
import { secToMs, waitTimeout } from '../../helpers/general';
import logger from '../../logger';
import { NikeFlashDropRepositoryInterface } from '../../repositories/NikeFlashDropRepositoryInterface';
import { NikeAPISearchRequest } from '../../requests/nike/interfaces/requests/NikeAPISearchRequest';
import { NikeFlashDropsMonitorService } from '../../services/NikeFlashDropMonitorService';
import { Monitor } from '../Monitor';
import path from 'path';
import { Product } from '../../requests/nike/interfaces/responses/NikeAPISearchResponse';
import { CurrentResultsUrlsFromAllSearchs } from './interfaces/CurrentResultsUrlsFromAllSearchsInterface';

export class NikeFlashDropsMonitor extends Monitor {
	protected minTimeout: number = secToMs(10);
	protected maxTimeout: number = secToMs(60);

	constructor(
		private _requestsObjects: NikeAPISearchRequest[],
		private _currentUrlsFromAllSearchs: CurrentResultsUrlsFromAllSearchs,
		protected _flashDropRepository: NikeFlashDropRepositoryInterface,
		private _nikeFlashDropMonitorService: NikeFlashDropsMonitorService,
		private _discordClient: Client
	) {
		super();
	}

	private _handleNewUniqueSneakers(newUniqueSneakers: Product[]) {
		if (newUniqueSneakers.length > 0) {
			this.log.info(
				{ newUniqueSneakers },
				'New Unique Sneakers found',
				newUniqueSneakers.map(product => product.extraAttributes.skuReference)
			);
			this._discordClient.emit(
				'flashDrop',
				this._discordClient,
				newUniqueSneakers.map(product => this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(product))
			);
		}
	}

	private _handleNewSearchResults(
		thisRunSearchSneakersUrls: string[],
		thisRunUniqueSneakers: Product[],
		allFilteredSneakers: Product[]
	) {
		if (this._isEmptyCurrentResultsUrls()) {
			this._updateCurrentResultsUrlsJSON(thisRunSearchSneakersUrls);
			return;
		}

		const newResults = this._newResultsOnSearch(
			this._currentUrlsFromAllSearchs.currentResultsUrlsFromAllSearchs,
			thisRunSearchSneakersUrls
		);

		if (newResults.length === 0) {
			return;
		}

		this._updateCurrentResultsUrlsJSON(thisRunSearchSneakersUrls);

		const onlyNewSneakersUrlsOnCurrentRunThatAreNotAlsoUnique = _.difference(
			newResults,
			thisRunUniqueSneakers.map(product => product.productUrl)
		);

		if (onlyNewSneakersUrlsOnCurrentRunThatAreNotAlsoUnique.length === 0) {
			return;
		}

		const productObjects = allFilteredSneakers.filter(product =>
			onlyNewSneakersUrlsOnCurrentRunThatAreNotAlsoUnique.includes(
				this._nikeFlashDropMonitorService.changeUrlSlashesToHttps(product.productUrl)
			)
		);
		const mapped = productObjects.map(product =>
			this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(product)
		);
		this.log.info({ newFoundOnSearch: mapped }, 'New Sneakers found on search');
		this._discordClient.emit('searchFoundSneaker', this._discordClient, mapped);
	}

	async check(): Promise<void> {
		let thisRunSearchSneakersUrls: string[] = [];
		let thisRunUniqueSneakers: Product[] = [];
		let thisRunFilteredSneakers: Product[] = [];

		for (const requestObject of this._requestsObjects) {
			await waitTimeout({ min: secToMs(3), max: secToMs(10) });
			this.log.info(`Getting search sneakers: ${requestObject.search}`);

			const sneakers = await this._flashDropRepository.getCurrentSearchSneakersData(requestObject);
			const filteredSneakers = this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(sneakers);
			const newUniqueSneakers = await this._flashDropRepository.filterUniqueSneakers(filteredSneakers);
			const currentSearchUrls = filteredSneakers.map(sneaker => sneaker.productUrl.replace('//', 'https://'));

			this._handleNewUniqueSneakers(newUniqueSneakers);

			thisRunFilteredSneakers = [...thisRunFilteredSneakers, ...filteredSneakers];
			thisRunUniqueSneakers = [...thisRunUniqueSneakers, ...newUniqueSneakers];
			thisRunSearchSneakersUrls = [...thisRunSearchSneakersUrls, ...currentSearchUrls];
		}
		this._handleNewSearchResults(
			_.uniq(thisRunSearchSneakersUrls),
			thisRunUniqueSneakers,
			_.uniqBy(thisRunFilteredSneakers, 'productUrl')
		);
		this.reRunCheck();
	}

	private _newResultsOnSearch(objectResultsUrls: string[], currentSearchUrls: string[]) {
		return _.difference(currentSearchUrls, objectResultsUrls);
	}

	private _isEmptyCurrentResultsUrls() {
		return this._currentUrlsFromAllSearchs.currentResultsUrlsFromAllSearchs.length === 0;
	}

	private _updateCurrentResultsUrlsJSON(currentUrls: string[]) {
		const updatedOb = { ...this._currentUrlsFromAllSearchs, currentResultsUrlsFromAllSearchs: currentUrls };

		this._currentUrlsFromAllSearchs = updatedOb;

		fs.writeFile(
			path.join(__dirname, '../../../requests/nike/current-results-urls-from-all-searchs.json'),
			JSON.stringify(updatedOb, null, 2),
			err => {
				if (err) console.log(err);
				console.log('file updated');
			}
		);
	}

	async checkCorrect(): Promise<void> {
		for (const requestObject of this._requestsObjects) {
			await waitTimeout({ min: secToMs(3), max: secToMs(10) });
			this.log.info(`Getting search sneakers: ${requestObject.search}`);
			const newSneakers = await this._flashDropRepository.getNewSneakersOfThisSearch(requestObject);

			if (newSneakers.length > 0) {
				this.log.info({ newSneakers }, 'New Sneakers found', 'NikeFlashDropMonitor.check()');
				this._discordClient.emit('flashDrop', this._discordClient, newSneakers);
			}
		}

		this.reRunCheck();
	}
}
