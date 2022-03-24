import logger from "../logger";

export const randomIntFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const waitTimeout = (config: { min: number; max: number }) =>
  new Promise((resolve) => {
    const timeoutTime = randomIntFromInterval(config.min, config.max);
    setTimeout(() => {
      resolve(`waited ${timeoutTime}`);
    }, timeoutTime);
  });

export const exitHandler = (options: any) => {
  if (options.exit) {
    logger.info("exitHandler. options.exit: ", options.exit);
    process.exit();
  }
};

export const minToMs = (minutes: number): number => minutes * 60000; // Ex.: 2min * 60000 = 120000ms

export const secToMs = (seconds: number): number => seconds * 1000;

export const msToSec = (ms: number): number => ms / 1000;
