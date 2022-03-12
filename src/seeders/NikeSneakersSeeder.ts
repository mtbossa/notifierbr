import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { NikeFlashDropAPIRequestData } from '../requests/nike/interfaces/requests/NikeFlashDropAPIRequestData';
import { Product } from '../requests/nike/interfaces/responses/NikeFlashDropProductResponseInterfaces';

(async () => {
	const prismaClient = new PrismaClient();
	const requestsObjects: NikeFlashDropAPIRequestData[] = require('../requests/nike/nike-flash-drop-requests.json');

	for (const searchRequest of requestsObjects) {
		for (const request of searchRequest.requests) {
			try {
				const response = await axios(request); // this is one page request for the same query search, ex.: tenis air jordan, tenis air jordan page 2
				const products = response.data.productsInfo.products as Product[];

				for (const product of products) {
					const foundProduct = await prismaClient.product.findUnique({
						where: { name: product.name },
					});
					if (foundProduct) continue;
					await prismaClient.product.create({ data: { name: product.name } });
					console.log(
						'created: ',
						await prismaClient.product.findUnique({ where: { name: product.name } })
					);
				}
			} catch (e: unknown) {
				if (e instanceof Error) console.log(e.message);
			}
		}
	}
})();
