export interface SiteInfo {
	name: string;
	domain: string;
	country: string;
	region: string;
	lang: string;
	currency: string;
}

export interface MenuItem {
	Categoria: string;
	Loja: string;
}

export interface MenuIteraction {
	menuType: string;
	menuItem: MenuItem;
}

export interface Category {
	categoryID: string;
	categoryName: string;
}

export interface Department {
	departmentID: string;
	departmentName: string;
}

export interface SubDepartment {
	subDepartmentID?: any;
	subDepartmentName: string;
}

export interface ListItem {
	productId: string;
	name: string;
	productNikeId: string;
	salePrice: string;
	basePrice: number;
	productGender: string;
	nameCategory: string;
	department: string;
	subDepartment: string;
	technology: string;
	collection: string;
	availability: string;
	productReviews: number;
	review: number;
	snickers: string;
	gridPosition: string;
	priceStatus: string;
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
	menuIteraction: MenuIteraction;
	name: string;
	pageNumber: string;
	templateName: string;
	filters: any[];
	totalProductsListed: string;
	category: Category;
	department: Department;
	subDepartment: SubDepartment;
	pageType: string;
	breadCrumb: string;
	listItems: ListItem[];
	pathname: string;
}

export interface SessionInfo {
	loginStatus: string;
}

export interface ProductInfo {
	gridPosition: string;
	productId: string;
}

export interface NikeShoesPageDataLayerResponse {
	siteInfo: SiteInfo;
	pageInfo: PageInfo;
	sessionInfo: SessionInfo;
	productInfo: ProductInfo[];
}
