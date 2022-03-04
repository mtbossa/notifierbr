import client from './bot';

export const log = (...args: any) => {
	console.log('-----------------------------');
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

export const arrayDifference = <T>(
	incomeArray: Array<T>,
	compareArray: Array<T>
): Array<T> => {
	return incomeArray.filter(x => !compareArray.includes(x));
};
