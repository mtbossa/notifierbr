import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const prodcuts = await prisma.product.findMany({
		include: {
			stores: { select: { product_url: true, store: true } },
		},
	});
	console.log(prodcuts);
	prodcuts.forEach(element => {
		console.log('here: ', element.stores);
	});
	const test = await prisma.productsOnStore.findMany();
	console.log(test);
}

main()
	.catch(e => {
		throw e;
	})

	.finally(async () => {
		await prisma.$disconnect();
	});
