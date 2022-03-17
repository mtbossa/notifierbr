export const log = (...args: any) => {
	const now = new Date().toLocaleString();
	console.log(`----------------------------- ${now} -----------------------------`);
	console.log(...args);
};

export const randomIntFromInterval = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const waitTimeout = (min: number, max: number) =>
	new Promise((resolve, reject) => {
		const timeoutTime = randomIntFromInterval(min, max);
		setTimeout(() => {
			resolve(`waited ${timeoutTime}`);
		}, timeoutTime);
	});

export const exitHandler = (options: any, exitCode: any) => {
	if (options.exit) {
		console.log('exiting');
		process.exit();
	}
};

export const minToMs = (minutes: number): number => {
	return minutes * 60000; // Ex.: 2min * 60000 = 120000ms
};

export const secToMs = (seconds: number): number => {
	return seconds * 1000; // Ex.: 30sec * 1000 = 30000ms
};
