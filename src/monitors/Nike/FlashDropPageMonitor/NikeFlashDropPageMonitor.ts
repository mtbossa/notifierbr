import { Client } from 'discord.js';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { minToMs, secToMs, waitTimeout } from '../../../helpers/general';
import { SneakerData } from '../../../models/interfaces/SneakerDataInterface';
import { prismaClient } from '../../../prismaClient';
import {
	ListItem,
	NikeShoesPageDataLayerResponse,
} from '../../../requests/nike/interfaces/responses/NikeShoesPageDataLayerResponse';
import { NikeFlashDropsMonitorService } from '../../../services/NikeFlashDropMonitorService';
import { Monitor } from '../../Monitor';

export class NikeFlashDropPageMonitor extends Monitor {
	protected minTimeout: number = secToMs(10);
	protected maxTimeout: number = secToMs(60);

	private _browser?: Browser;
	private _page?: Page;
	private _sneakersNamesToMonitor = [
		'air jordan 1 ',
		'air jordan 4 ',
		'dunk low',
		'dunk high',
		'nike x sacai',
		'sb dunk',
	];

	constructor(protected pages: string[], private _userAgent: UserAgent, private _discordClient: Client) {
		super();
	}

	public async setUpPuppeteer() {
		puppeteer.use(StealthPlugin());
		puppeteer.use(
			require('puppeteer-extra-plugin-block-resources')({
				blockedTypes: new Set(['image', 'stylesheet', 'media', 'font']),
			})
		);
		this._browser = await puppeteer.launch({});
		this._page = await this._browser.newPage();

		return this;
	}

	private async _resetBrowser() {
		this.log.info(`Got banned. Reseting browser`);

		this._browser!.close();
		this._browser = await puppeteer.launch({});
		this._page = await this._browser.newPage();
		await this._page.reload();

		return this;
	}

	private async getPageDataLayerResponse(pageUrl: string): Promise<NikeShoesPageDataLayerResponse> {
		const wantedUrl = 'https://www.nike.com.br/DataLayer/dataLayer';
		const page = await this._browser!.newPage();
		await page.setUserAgent(this._userAgent.random().toString());
		const [res] = await Promise.all([
			page.waitForResponse(res => res.url() === wantedUrl, { timeout: 90000 }),
			page.goto(pageUrl, { waitUntil: 'domcontentloaded' }),
		]);
		return await res.json();
	}

	private filterOnlyDesiredSneakers(listItems: ListItem[]): ListItem[] {
		return listItems
			.filter(listItem =>
				// Remove all that we don't want
				this._sneakersNamesToMonitor.some(nameToMonitor => listItem.name.toLowerCase().includes(nameToMonitor))
			)
			.filter(listItem => !listItem.name.toLowerCase().includes('infantil')) // Removes infantis
			.filter(listItem => listItem.availability !== 'no'); // Removes not availables
	}

	public async filterUniqueSneakers(listItems: ListItem[]): Promise<ListItem[]> {
		let newSneakers: ListItem[] = [];

		for (const listItem of listItems) {
			const styleCode = listItem.productNikeId;
			const foundProduct = await this.findUniqueProduct(styleCode);

			if (!foundProduct) {
				this.log.info({ APIProductName: listItem.name }, 'Product name not found on database, Flash Drop!');
				newSneakers = [...newSneakers, listItem];
				await this.createProduct({ productName: listItem.name, styleCode, brand: 'Nike' });
			}
		}

		return newSneakers;
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
			this.log.info({ ProductCreateName: productCreated.name }, 'Product create!');
		} catch (e) {
			if (e instanceof Error) {
				this.log.error({
					err: e,
					errorMsg: e.message,
					method: 'NikeFlashDropAPIRespository.createProduct',
					productInfo,
				});
			}
		}
	}

	public async findUniqueProduct(styleCode: string) {
		try {
			return await prismaClient.product.findUnique({ where: { style_code: styleCode } });
		} catch (e) {
			if (e instanceof Error) {
				this.log.error({
					err: e,
					errorMsg: e.message,
					method: 'NikeFlashDropAPIRespository.findUniqueProduct',
					styleCode,
				});
			}
		}
	}

	private _handleNewUniqueSneakers(newUniqueSneakers: SneakerData[]) {
		if (newUniqueSneakers.length > 0) {
			this.log.warn({ newUniqueSneakers }, 'New Unique Sneakers found');
			this._discordClient.emit('flashDrop', this._discordClient, newUniqueSneakers);
		}
	}

	private _getUrls(sneaker: ListItem) {
		return { url: 'oi', imgUrl: 'oi' };
	}

	private async mapNeededSneakerDataForDiscord(sneakers: ListItem[]): Promise<SneakerData[]> {
		let mappedSneakers: SneakerData[] = [];

		for (const sneaker of sneakers) {
			const { url, imgUrl } = this._getUrls(sneaker);
			const mappedSneaker = {
				name: sneaker.name,
				url: url,
				imgUrl: imgUrl,
				price: `R$ ${sneaker.salePrice}`,
				styleCode: sneaker.productNikeId,
			} as SneakerData;

			mappedSneakers = [...mappedSneakers, mappedSneaker];
		}

		return mappedSneakers;
	}

	async check(): Promise<void> {
		try {
			for (const pageUrl of this.pages) {
				const dataLayerResponse: NikeShoesPageDataLayerResponse = await this.getPageDataLayerResponse(pageUrl);
				const listItems: ListItem[] = dataLayerResponse.pageInfo.listItems;
				const filteredListItems = this.filterOnlyDesiredSneakers(listItems);
				const newSneakers = await this.filterUniqueSneakers(filteredListItems);

				if (newSneakers.length === 0) continue;

				const discordMappedNewUniqueSneakers = await this.mapNeededSneakerDataForDiscord(newSneakers);

				this._handleNewUniqueSneakers(discordMappedNewUniqueSneakers);
			}
		} catch (e) {
			this.log.error({ err: e });
		}
	}
}
