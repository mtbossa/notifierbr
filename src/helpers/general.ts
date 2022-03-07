import client from '../bot';

export const log = (...args: any) => {
	const now = new Date().toISOString();
	console.log(`${now} -----------------------------`);
	console.log(...args);
};

export const exitHandler = (options: any, exitCode: any) => {
	if (options.cleanup) console.log('clean');
	if (exitCode || exitCode === 0) console.log(exitCode);
	if (options.exit) {
		client.removeAllListeners();
		client.destroy();
		process.exit();
	}
};
