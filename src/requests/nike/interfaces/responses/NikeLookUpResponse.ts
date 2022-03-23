export interface Images {
  default: string;
  '800-x-800': string;
  '440-x-440': string;
  '380-x-380': string;
  '310-x-310': string;
  '260-x-260': string;
  '50-x-50': string;
}

export interface Category {
  id: string;
  name: string;
  parents: string[];
}

export interface Installment {
  count: number;
  price: number;
}

export interface Specs {
  color: string[];
  size: string[];
}

export interface Details {
  'Altura do Cano': string[];
  Marcas: string[];
  Tecnologia: string[];
  Esporte: string[];
  'Categoria de Produto': string[];
  Modelos: string[];
  'Tipo de Produto': string[];
  Gênero: string[];
  shortDescription: string;
  skuReference: string;
}

export interface Specs2 {
  size: string;
  color: string;
}

export interface Installment2 {
  count: number;
  price: number;
}

export interface Images2 {
  default: string;
  '800-x-800': string;
  '440-x-440': string;
  '380-x-380': string;
  '310-x-310': string;
  '260-x-260': string;
  '50-x-50': string;
}

export interface Details2 {
  colorReference: string;
  '550-x-550': string;
  '50-x-50': string;
  specsSizeOrder: number;
  sizeAndOrder: string;
  flags: string[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface Sku {
  sku: string;
  status: string;
  specs: Specs2;
  name: string;
  url: string;
  description: string;
  oldPrice: number;
  price: number;
  stock: number;
  installment: Installment2;
  images: Images2;
  details: Details2;
  tags: Tag[];
}

export interface NikeLookUpResponse {
  status: string;
  id: any;
  name: string;
  url: string;
  stock: number;
  eanCode: string;
  description: string;
  published: string;
  price: number;
  oldPrice: number;
  salesChannel: string;
  images: Images;
  categories: Category[];
  installment: Installment;
  specs: Specs;
  details: Details;
  tags: string[];
  skus: Sku[];
}
