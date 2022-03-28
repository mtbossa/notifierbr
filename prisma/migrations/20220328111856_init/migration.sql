-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "brand" VARCHAR NOT NULL,
    "style_code" VARCHAR,
    "release_date" DATE,
    "current_lowest_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_stores" (
    "id" BIGSERIAL NOT NULL,
    "products_id" BIGINT NOT NULL,
    "stores_id" INTEGER NOT NULL,
    "product_url" TEXT NOT NULL,
    "current_price" DECIMAL(12,2),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_stores_pkey" PRIMARY KEY ("id","products_id","stores_id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sneakers_stores_stocks" (
    "id" BIGSERIAL NOT NULL,
    "products_stores_id" BIGINT NOT NULL,
    "size" DECIMAL(12,1) NOT NULL,
    "stock" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sneakers_stores_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_style_code_key" ON "products"("style_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_stores_id_key" ON "products_stores"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_stores_product_url_key" ON "products_stores"("product_url");

-- CreateIndex
CREATE UNIQUE INDEX "stores_name_key" ON "stores"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stores_url_key" ON "stores"("url");

-- CreateIndex
CREATE UNIQUE INDEX "sneakers_stores_stocks_products_stores_id_size_key" ON "sneakers_stores_stocks"("products_stores_id", "size");

-- AddForeignKey
ALTER TABLE "products_stores" ADD CONSTRAINT "products_stores_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_stores" ADD CONSTRAINT "products_stores_stores_id_fkey" FOREIGN KEY ("stores_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sneakers_stores_stocks" ADD CONSTRAINT "sneakers_stores_stocks_products_stores_id_fkey" FOREIGN KEY ("products_stores_id") REFERENCES "products_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
