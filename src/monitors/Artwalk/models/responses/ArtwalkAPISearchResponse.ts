export interface ClusterHighlights {}

export interface ProductClusters {
  830: string;
  831: string;
}

export interface SearchableClusters {}

export interface ReferenceId {
  Key: string;
  Value: string;
}

export interface Image {
  imageId: string;
  imageLabel: string;
  imageTag: string;
  imageUrl: string;
  imageText: string;
  imageLastModified: Date;
}

export interface Installment {
  Value: number;
  InterestRate: number;
  TotalValuePlusInterestRate: number;
  NumberOfInstallments: number;
  PaymentSystemName: string;
  PaymentSystemGroupName: string;
  Name: string;
}

export interface DeliverySlaSample {
  DeliverySlaPerTypes: any[];
  Region?: any;
}

export interface SellerMerchantInstallment {
  id: string;
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
}

export interface Installment2 {
  count: number;
  hasInterestRate: boolean;
  interestRate: number;
  value: number;
  total: number;
  sellerMerchantInstallments: SellerMerchantInstallment[];
}

export interface InstallmentOption {
  paymentSystem: string;
  bin?: any;
  paymentName: string;
  paymentGroupName: string;
  value: number;
  installments: Installment2[];
}

export interface PaymentSystem {
  id: number;
  name: string;
  groupName: string;
  validator?: any;
  stringId: string;
  template: string;
  requiresDocument: boolean;
  isCustom: boolean;
  description?: any;
  requiresAuthentication: boolean;
  dueDate: Date;
  availablePayments?: any;
}

export interface PaymentOptions {
  installmentOptions: InstallmentOption[];
  paymentSystems: PaymentSystem[];
  payments: any[];
  giftCards: any[];
  giftCardMessages: any[];
  availableAccounts: any[];
  availableTokens: any[];
}

export interface CommertialOffer {
  Installments: Installment[];
  DiscountHighLight: any[];
  GiftSkuIds: any[];
  Teasers: any[];
  BuyTogether: any[];
  ItemMetadataAttachment: any[];
  Price: number;
  ListPrice: number;
  PriceWithoutDiscount: number;
  RewardValue: number;
  PriceValidUntil: Date;
  AvailableQuantity: number;
  IsAvailable: boolean;
  Tax: number;
  SaleChannel: number;
  DeliverySlaSamples: DeliverySlaSample[];
  GetInfoErrorMessage: string;
  CacheVersionUsedToCallCheckout: string;
  PaymentOptions: PaymentOptions;
}

export interface Seller {
  sellerId: string;
  sellerName: string;
  addToCartLink: string;
  sellerDefault: boolean;
  commertialOffer: CommertialOffer;
}

export interface Item {
  itemId: string;
  name: string;
  nameComplete: string;
  complementName: string;
  ean: string;
  referenceId: ReferenceId[];
  measurementUnit: string;
  unitMultiplier: number;
  modalType?: any;
  isKit: boolean;
  images: Image[];
  Tamanho: string[];
  variations: string[];
  sellers: Seller[];
  Videos: any[];
  estimatedDateArrival: Date;
}

export interface Field {
  id: number;
  name: string;
  isActive: boolean;
  position: number;
  type: string;
}

export interface Value {
  id: string;
  name: string;
  position: number;
}

export interface SkuSpecification {
  field: Field;
  values: Value[];
}

export interface ArtwalkAPISearchResponse {
  productId: string;
  productName: string;
  brand: string;
  brandId: number;
  brandImageUrl?: any;
  linkText: string;
  productReference: string;
  productReferenceCode: string;
  categoryId: string;
  productTitle: string;
  metaTagDescription: string;
  releaseDate: Date;
  clusterHighlights: ClusterHighlights;
  productClusters: ProductClusters;
  searchableClusters: SearchableClusters;
  categories: string[];
  categoriesIds: string[];
  link: string;
  Gêneros: string[];
  Coleção: string[];
  Estilo: string[];
  "Tipo de Produto": string[];
  Cor: string[];
  "Cod. Ref. Variação": string[];
  Assinaturas: string[];
  Características: string[];
  allSpecifications: string[];
  allSpecificationsGroups: string[];
  description: string;
  items: Item[];
  skuSpecifications: SkuSpecification[];
}
