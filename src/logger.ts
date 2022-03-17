import path from 'path';
import pino, { StreamEntry } from 'pino';
import fs from 'fs';
import pretty from 'pino-pretty';

let streams: StreamEntry[] = [
	{ stream: process.stdout },
	{ level: 'error', stream: fs.createWriteStream(path.join(__dirname, '../', 'logs/log-error.log')) },
	{ level: 'warn', stream: fs.createWriteStream(path.join(__dirname, '../', 'logs/warn-error.log')) },
];
let level = 'info';
let appName = 'notifierbr';

if (process.env.NODE_ENV === 'dev') {
	appName = 'dev-notifierbr';
	streams = [
		...streams,
		{ stream: pretty({ colorize: true, translateTime: 'yyyy-mm-dd HH:MM:ss' }) },
		{ level: 'info', stream: fs.createWriteStream(path.join(__dirname, '../', 'logs/log-info.log')) },
	];
	level = 'debug';
}

export default pino(
	{
		name: appName,
		level: level,
	},
	pino.multistream(streams)
);
