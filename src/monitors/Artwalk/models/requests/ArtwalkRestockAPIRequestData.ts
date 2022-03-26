import { AxiosRequestConfig } from "axios";

export type ArtwalkRestockAPIRequestData = {
  sneakerName: string;
  styleCode: string;
  url: string;
  imgUrl: string;
  request: AxiosRequestConfig;
};
