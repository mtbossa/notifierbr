export interface SiteInfo {
  name: string;
  domain: string;
  country: string;
  region: string;
  lang: string;
  currency: string;
}

export interface PageInfo {
  brandName: string;
  protocol: string;
  referrer: string;
  hasjQuery: boolean;
  buscaOrganica: boolean;
  chargeTime?: any;
  banners: any[];
  bannerPosition: any[];
  tranckingCode: string;
  itemBusca: string;
  server: string;
  menuIteraction: any[];
  name: string;
  templateName: string;
  pageType: string;
  pathname: string;
}

export interface SessionInfo {
  loginStatus: string;
}

export interface ProductInfo {
  productId: string;
  name: string;
  productNikeId: string;
  salePrice: string;
  basePrice: number;
  productGender: string;
  nameCategory: string;
  department: string;
  subDepartment: string;
  technology: any[];
  collection: string;
  availability: string;
  productReviews: number;
  review: number;
  snickers: string;
  priceStatus: string;
  season: any[];
}

export interface NikeProductDataLayerResponse {
  siteInfo: SiteInfo;
  pageInfo: PageInfo;
  sessionInfo: SessionInfo;
  productInfo: ProductInfo;
}
