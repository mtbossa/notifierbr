import { exitHandler } from './helpers/general';
import { NikeFlashDropsMonitor } from './monitors/nikeFlashDropsMonitor';
import { configureBotClient } from './discord-bot'; // Runs code when imported (bot.ts runs code when called)
import { StockAvailabilityMonitor } from './monitors/stockAvailabilityMonitor';
import { prisma, PrismaClient } from '@prisma/client';
import { NikeSnkrsCalendarMonitor } from './monitors/nikeSnkrsCalendarMonitor';
import { createNikeFlashDropMonitor } from './monitors/NikeFlashDropMonitorFactory';
import { NikeAPIRequestData } from './monitors/NikeFlashDropMonitorTest';
import { Client } from 'discord.js';

const startNikeFlashDropsMonitor = async (discordClient: Client) => {
	const nikeFlashDropsMonitor = new NikeFlashDropsMonitor(discordClient);
	await nikeFlashDropsMonitor.createBrowser();
	await nikeFlashDropsMonitor.setPage(
		'https://www.nike.com.br/lancamento-todos-110'
	);
	nikeFlashDropsMonitor.start();
};

const startStockAvailabilityMonitor = async (
	prismaClient: PrismaClient,
	discordClient: Client
) => {
	const stockAvailabilityMonitor = new StockAvailabilityMonitor(
		discordClient,
		prismaClient
	);
	await stockAvailabilityMonitor.createBrowser();
	stockAvailabilityMonitor.start();
};

const startNikeSnkrsCalendarMonitor = async (discordClient: Client) => {
	const nikeSnkrsCalendarMonitor = new NikeSnkrsCalendarMonitor(discordClient);
	await nikeSnkrsCalendarMonitor.createBrowser();
	await nikeSnkrsCalendarMonitor.setPage('https://www.nike.com.br/snkrs');
	nikeSnkrsCalendarMonitor.start();
};

const startNikeFlashDropsMonitors = async (discordClient: Client) => {
	const requestsObjects: NikeAPIRequestData[] = require('../requests/nike/nike-requests.json'); // array with axios formatted request for nike sneakers search

	for (const searchRequest of requestsObjects) {
		createNikeFlashDropMonitor(searchRequest, discordClient).start();
	}
};

// Starts all process
(async () => {
	process.stdin.resume();
	process.on('SIGINT', exitHandler.bind(null, { exit: true }));
	
	const client = await configureBotClient();
	const prismaClient = new PrismaClient();
	
	startNikeFlashDropsMonitors(client);
	// startNikeFlashDropsMonitor();
	// startNikeSnkrsCalendarMonitor();
	// await startStockAvailabilityMonitor(prismaClient);
})();
