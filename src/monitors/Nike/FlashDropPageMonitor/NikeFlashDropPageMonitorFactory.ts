import { Client } from 'discord.js';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import puppeteer from 'puppeteer-extra';
import { NikeFlashDropPageMonitor } from './NikeFlashDropPageMonitor';
import { NikeFlashDropPageRepository } from '../../../repositories/implementations/NikeFlashDropPageRepository';
import { NikeFlashDropsMonitorService } from '../../../services/NikeFlashDropMonitorService';

export async function createFlashDropPageMonitor(discordClient: Client) {
	const userAgent = new UserAgent({ deviceCategory: 'desktop' });
	const pages = ['https://www.nike.com.br/masculino/calcados', 'https://www.nike.com.br/feminino/calcados'];

	const nikeFlashDropPageMonitor = await new NikeFlashDropPageMonitor(pages, userAgent, discordClient).setUpPuppeteer();

	return nikeFlashDropPageMonitor;
}
