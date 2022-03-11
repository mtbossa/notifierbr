import { AxiosRequestConfig } from 'axios';

export type NikeFlashDropAPIRequestData = {
	search: string;
	requests: AxiosRequestConfig[];
};
