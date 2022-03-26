export interface CollectInfo {
  skuList: any[];
  productId: string;
}

export interface Spec {
  size: string;
  color: string;
}

export interface Image {
  "260-x-260": string;
  "310-x-310": string;
  "380-x-380": string;
  "440-x-440": string;
  "50-x-50": string;
  "800-x-800": string;
  default: string;
}

export interface Installment {
  count: number;
  price: number;
}

export interface Detail {
  colorReference: string;
  "550-x-550": string;
  "50-x-50": string;
  flags: string[];
  specsSizeOrder: number;
  sizeAndOrder: string;
}

export interface Tag {
  id: string;
  name: string;
  parents: any[];
}

export interface Property {
  images: Image;
  oldPrice: number;
  price: number;
  installment: Installment;
  name: string;
  details: Detail;
  stock: number;
  url: string;
  status: string;
  tags: Tag[];
}

export interface Sku {
  sku: string;
  specs: Spec;
  properties: Property;
}

export interface ProductInstallment {
  amount: string;
  qty: number;
  amountRaw: string;
}

export interface ProductTag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  parents: any[];
  used: boolean;
}

export interface ExtraAttribute {
  categoriaDeProduto: string[];
  esporte: string[];
  skuReference: string[];
  marcas: string[];
  alturaDoCano: string[];
  tipoDeProduto: string[];
  gênero: string[];
  shortDescription: string[];
  salesChannel: string[];
  categoryName: string[];
}

export interface Product {
  name: string;
  isAvailable: number;
  originalId: string;
  imageUrl: string;
  productUrl: string;
  ranking: number;
  discountedPrice: string;
  discountedPriceRaw: string;
  categoryId: string;
  categoryName: string;
  collectInfo: CollectInfo;
  price: string;
  priceRaw: string;
  skus: Sku[];
  description: string;
  clickUrl: string;
  installments: ProductInstallment[];
  images: Image;
  created: string;
  tags: ProductTag[];
  categories: Category[];
  specs: Spec;
  isDiscount: boolean;
  extraAttributes: ExtraAttribute;
  subtitle: string;
}

export interface ProductsInfo {
  products: Product[];
  protocolProductsList: string;
  recommendationProductList: string;
}

export interface PaginationItem {
  pageNumber: number;
  isFirst: boolean;
  link: string;
  active: boolean;
  isPrevious?: boolean;
  previous: string;
  next: string;
  selected?: boolean;
  isPageNumber?: boolean;
  isNext?: boolean;
  isLast?: boolean;
}

export interface Pagination {
  paginationItems: PaginationItem[];
  numberOfPages: number;
  hasPagination: boolean;
  totalResults: number;
}

export interface NikeAPISearchResponse {
  productsInfo: ProductsInfo;
  pagination: Pagination;
}
