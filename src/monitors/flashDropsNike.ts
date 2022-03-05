import { Page } from 'puppeteer';
import { FlashDropsNikeService } from '../services/flashDropsNikeService';

const monitorFlashDrops = async (page: Page) => {
	const newJordans = await FlashDropsNikeService.hasNewJordans(page);
	if (newJordans.length > 0) console.log(newJordans);
};
