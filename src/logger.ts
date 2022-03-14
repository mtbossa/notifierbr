import path from 'path';
import pino, { StreamEntry } from 'pino';
import fs from 'fs';
import pretty from 'pino-pretty';

let streams: StreamEntry[] = [
	{ level: 'info', stream: process.stdout },
	{ stream: fs.createWriteStream(path.join(__dirname, '../', 'logs/log.stream.out')) },
];
let level = 'info';

if (process.env.NODE_ENV === 'dev') {
	streams = [...streams, { stream: pretty({ colorize: true }) }];
	level = 'debug';
}

export default pino(
	{
		enabled: true,
		level: level,
	},
	pino.multistream(streams)
);
