import { exitHandler } from './helpers/general';
import { configureBotClient } from './discord-bot'; // Runs code when imported (bot.ts runs code when called)
import { PrismaClient } from '@prisma/client';
import { createNikeFlashDropMonitor } from './monitors/NikeFlashDropMonitor/NikeFlashDropMonitorFactory';
import { Client } from 'discord.js';
import { NikeRestockAPIRequestData } from './requests/nike/interfaces/requests/NikeRestockAPIRequestData';
import { createRestockDropMonitor } from './monitors/NikeRestockMonitor/NikeRestockMonitorFactory';
import { NikeFlashDropAPIRequestData } from './requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';

const startNikeFlashDropsMonitors = async (discordClient: Client) => {
	const requestsObjects: NikeFlashDropAPIRequestData[] = require('../requests/nike/nike-flash-drop-requests.json'); // array with axios formatted request for nike sneakers search

	for (const searchRequest of requestsObjects) {
		createNikeFlashDropMonitor(searchRequest, discordClient).start();
	}
};

const startNikeRestockMonitors = async (discordClient: Client) => {
	const monitor = await createRestockDropMonitor(discordClient);
	monitor.start();
};

// Starts all process
(async () => {
	process.stdin.resume();
	process.on('SIGINT', exitHandler.bind(null, { exit: true }));
	const client = await configureBotClient();

	startNikeFlashDropsMonitors(client);
	startNikeRestockMonitors(client);

	// startNikeSnkrsCalendarMonitor();
})();
