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
import { CurrentResultsStylesCodeFromAllSearchs } from './interfaces/CurrentResultsStylesCodeFromAllSearchsInterface';

export class NikeFlashDropsMonitor extends Monitor {
	protected minTimeout: number = secToMs(10);
	protected maxTimeout: number = secToMs(60);

	constructor(
		private _requestsObjects: NikeAPISearchRequest[],
		private _currentStylesCodeFromAllSearchs: CurrentResultsStylesCodeFromAllSearchs,
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
		thisRunSearchSneakersStylesCode: string[],
		thisRunUniqueSneakers: Product[],
		allFilteredSneakers: Product[]
	) {
		if (this._isEmptyCurrentResultsStylesCode()) {
			this._updateCurrentResultsStylesCodeJSON(thisRunSearchSneakersStylesCode);
			return;
		}

		const newResults = this._newResultsOnSearch(thisRunSearchSneakersStylesCode);
		this._updateCurrentResultsStylesCodeJSON(thisRunSearchSneakersStylesCode);

		if (newResults.length === 0) {
			return;
		}

		const onlyNewSneakersStylesCodeOnCurrentRunThatAreNotAlsoUnique = _.difference(
			newResults,
			thisRunUniqueSneakers.map(product => product.extraAttributes.skuReference[0])
		);

		if (onlyNewSneakersStylesCodeOnCurrentRunThatAreNotAlsoUnique.length === 0) {
			return;
		}

		const productObjectsOfNewStylesCodeSneakers = allFilteredSneakers.filter(product =>
			onlyNewSneakersStylesCodeOnCurrentRunThatAreNotAlsoUnique.includes(product.extraAttributes.skuReference[0])
		);
		const mappedSneakers = productObjectsOfNewStylesCodeSneakers.map(product =>
			this._nikeFlashDropMonitorService.mapNeededSneakerDataForDiscord(product)
		);
		this.log.info({ newFoundOnSearch: mappedSneakers }, 'New Sneakers found on search');
		this._discordClient.emit('searchFoundSneaker', this._discordClient, mappedSneakers);
	}

	async check(): Promise<void> {
		let thisRunSearchSneakersStylesCode: string[] = [];
		let thisRunUniqueSneakers: Product[] = [];
		let thisRunFilteredSneakers: Product[] = [];

		for (const requestObject of this._requestsObjects) {
			await waitTimeout({ min: secToMs(3), max: secToMs(10) });
			this.log.info(`Getting search sneakers: ${requestObject.search}`);

			const sneakers = await this._flashDropRepository.getCurrentSearchSneakersData(requestObject);
			const filteredSneakers = this._nikeFlashDropMonitorService.filterOnlyDesiredSneakers(sneakers);
			const newUniqueSneakers = await this._flashDropRepository.filterUniqueSneakers(filteredSneakers);
			const currentSearchStyleCodes = filteredSneakers.map(sneaker => sneaker.extraAttributes.skuReference[0]);

			this._handleNewUniqueSneakers(newUniqueSneakers);

			thisRunFilteredSneakers = [...thisRunFilteredSneakers, ...filteredSneakers];
			thisRunUniqueSneakers = [...thisRunUniqueSneakers, ...newUniqueSneakers];
			thisRunSearchSneakersStylesCode = [...thisRunSearchSneakersStylesCode, ...currentSearchStyleCodes];
		}
		this._handleNewSearchResults(
			_.uniq(thisRunSearchSneakersStylesCode),
			thisRunUniqueSneakers,
			_.uniqBy(thisRunFilteredSneakers, 'extraAttributes.skuReference[0]')
		);
		this.reRunCheck();
	}

	private _newResultsOnSearch(currentSearchStylesCode: string[]) {
		return _.difference(
			currentSearchStylesCode,
			this._currentStylesCodeFromAllSearchs.currentResultsStylesCodeFromAllSearchs
		);
	}

	private _isEmptyCurrentResultsStylesCode() {
		return this._currentStylesCodeFromAllSearchs.currentResultsStylesCodeFromAllSearchs.length === 0;
	}

	private _updateCurrentResultsStylesCodeJSON(thisRunSearchSneakersStylesCode: string[]) {
		const updatedOb = {
			currentResultsStylesCodeFromAllSearchs: thisRunSearchSneakersStylesCode,
		};

		this._currentStylesCodeFromAllSearchs = updatedOb;

		fs.writeFile(
			path.join(
				__dirname,
				'../../../control_files/Nike/NikeFlashDropMonitor/current-results-styles-code-from-all-searchs.json'
			),
			JSON.stringify(updatedOb, null, 2),
			err => {
				if (err) console.log(err);
				console.log('file updated');
			}
		);
	}
}
