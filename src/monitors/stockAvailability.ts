import { Page } from 'puppeteer';
import { StockAvailabilityService } from '../services/stockAvailabilityService';
import client from '../bot';

const product = {
	name: 'Air Jordan 1	Patent Bred',
	url: 'https://www.nike.com.br/snkrs/air-jordan-1-153-169-211-351285',
	image_url:
		'https://images.lojanike.com.br/1024x1024/produto/tenis-air-jordan-1-retro-high-og-masculino-555088-063-1-11637067284.jpg',
	store: 'Nike',
	store_image:
		'https://3dwarehouse.sketchup.com/warehouse/v1.0/publiccontent/ba6c1527-a9c5-4efa-af58-0930b3a8aa34',
};

const monitorStockAvailability = async (page: Page) => {
	const soldOff = await StockAvailabilityService.isSoldOff(page);

	if (!soldOff) {
		console.log('NÃO ESTÁ MAIS ESGOTADO');
		if (client.isReady()) client.emit('stockRefilled', product);
	} else {
		console.log('CONTINUA ESGOTADO');
		client.emit('outOfStock', 'Out of stock');
	}
};

export default monitorStockAvailability;
