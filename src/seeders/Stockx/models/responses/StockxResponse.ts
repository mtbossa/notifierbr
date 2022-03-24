export interface Pagination {
  query: string;
  queryID: string;
  index: string;
  limit: number;
  page: number;
  total: number;
  lastPage: string;
  sort: string[];
  order: string[];
  currentPage: string;
  nextPage: string;
  previousPage?: any;
}

export interface Media {
  imageUrl: string;
  smallImageUrl: string;
  thumbUrl: string;
  gallery: any[];
  hidden: boolean;
}

export interface Trait {
  name: string;
  value: any;
  filterable: boolean;
  visible: boolean;
  highlight: boolean;
}

export interface Market {
  productId: number;
  skuUuid: string;
  productUuid: string;
  lowestAsk: number;
  lowestAskSize: string;
  parentLowestAsk: number;
  numberOfAsks: number;
  hasAsks: number;
  salesThisPeriod: number;
  salesLastPeriod: number;
  highestBid: number;
  highestBidSize: string;
  numberOfBids: number;
  hasBids: number;
  annualHigh: number;
  annualLow: number;
  deadstockRangeLow: number;
  deadstockRangeHigh: number;
  volatility: number;
  deadstockSold: number;
  pricePremium: number;
  averageDeadstockPrice: number;
  lastSale: number;
  lastSaleSize: string;
  salesLast72Hours: number;
  changeValue: number;
  changePercentage: number;
  absChangePercentage: number;
  totalDollars: number;
  lastLowestAskTime: number;
  lastHighestBidTime: number;
  lastSaleDate: Date;
  createdAt: Date;
  updatedAt: number;
  deadstockSoldRank: number;
  pricePremiumRank: number;
  averageDeadstockPriceRank: number;
  featured: number;
}

export interface Product {
  id: string;
  uuid: string;
  brand: string;
  breadcrumbs: any[];
  browseVerticals: string[];
  category: string;
  charityCondition: number;
  childId?: any;
  colorway: string;
  condition: string;
  countryOfManufacture: string;
  dataType: string;
  description: string;
  hidden: boolean;
  listingType: string;
  minimumBid: number;
  gender: string;
  doppelgangers: any[];
  media: Media;
  name: string;
  productCategory: string;
  releaseDate: string;
  releaseTime: number;
  belowRetail: boolean;
  retailPrice: number;
  shoe: string;
  shortDescription: string;
  styleId: string;
  tickerSymbol: string;
  title: string;
  traits: Trait[];
  type: number;
  urlKey: string;
  year: number;
  shoeSize?: any;
  market: Market;
  _tags: string[];
  lock_selling: boolean;
  selling_countries: string[];
  buying_countries: string[];
  objectID: string;
}

export interface StockxResponse {
  Pagination: Pagination;
  Products: Product[];
}
