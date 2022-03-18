import { AxiosRequestConfig } from 'axios';

export interface NikeAPISearchRequest {
	search: string;
	request: AxiosRequestConfig;
}
