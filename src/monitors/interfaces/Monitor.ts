import { Browser } from 'puppeteer';
import { Page } from 'puppeteer';

export interface Monitor {
	start(): void;
	createBrowser(): Promise<void>;
	setPage(url: string): Promise<void>;
}
