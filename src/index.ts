import 'dotenv/config';
import { exitHandler } from './helpers/general';
import { NikeFlashDropsMonitor } from './monitors/flashDropsNike.monitor';
import client from './bot'; // Runs code when imported (bot.ts runs code when called)
import { StockAvailabilityMonitor } from './monitors/stockAvailability.monitor';
import { prisma, PrismaClient } from '@prisma/client';

const startNikeFlashDropsMonitor = async () => {
	const nikeFlashDropsMonitor = new NikeFlashDropsMonitor(client);
	await nikeFlashDropsMonitor.createBrowser();
	await nikeFlashDropsMonitor.setPage(
		'https://www.nike.com.br/lancamento-todos-110'
	);
	nikeFlashDropsMonitor.start();
};

const startStockAvailabilityMonitor = async (prismaClient: PrismaClient) => {
	const stockAvailabilityMonitor = new StockAvailabilityMonitor(
		client,
		prismaClient
	);
	await stockAvailabilityMonitor.createBrowser();
	stockAvailabilityMonitor.start();
};

// Starts all process
(async () => {
	process.stdin.resume();
	process.on('SIGINT', exitHandler.bind(null, { exit: true }));

	const prismaClient = new PrismaClient();

	await startNikeFlashDropsMonitor();
	// await startStockAvailabilityMonitor(prismaClient);
})();
