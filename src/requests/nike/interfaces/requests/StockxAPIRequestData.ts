import { AxiosRequestConfig } from 'axios';

export type StockxAPIRequestData = {
	search: string;
	searchUrl: string;
	baseUrl: string;
	url: string;
	request: AxiosRequestConfig;
};
