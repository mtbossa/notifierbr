import path from 'path';
import pino from 'pino';
import pinoms from 'pino-multi-stream'

let level = 'info';
if (process.env.NODE_ENV === 'dev') {
	level = 'debug';
}

const defaultOptions = {
	enabled: true,
	level: level,
};

export default pino(defaultOptions, pino.destination(path.join(__dirname, '../', 'logs/logger.log')));
