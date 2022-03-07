import 'dotenv/config';
import { exitHandler } from './helpers/general';
import { NikeFlashDropsMonitor } from './monitors/flashDropsNike';
import client from './bot';

// Starts all process
(async () => {
	process.stdin.resume();
	process.on('SIGINT', exitHandler.bind(null, { exit: true }));

	const nikeFlashDropsMonitor = new NikeFlashDropsMonitor(client);
	await nikeFlashDropsMonitor.createBrowser();
	await nikeFlashDropsMonitor.setPage(
		'https://www.nike.com.br/lancamento-todos-110'
	);
	nikeFlashDropsMonitor.start();
})();
