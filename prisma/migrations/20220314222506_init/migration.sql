-- CreateTable
CREATE TABLE "html_selectors" (
    "id" SERIAL NOT NULL,
    "price" TEXT,
    "stock_availability" TEXT,
    "store_id" INTEGER NOT NULL,

    CONSTRAINT "html_selectors_pkey" PRIMARY KEY ("id","store_id")
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(100) NOT NULL,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitors_products" (
    "monitors_id" INTEGER NOT NULL,
    "products_id" BIGINT NOT NULL,
    "store_id" INTEGER,
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "monitors_products_pkey" PRIMARY KEY ("products_id","monitors_id","id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "brand" VARCHAR NOT NULL,
    "style_code" VARCHAR,
    "release_date" TIMESTAMP(3),
    "current_lowest_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_stores" (
    "products_id" BIGINT NOT NULL,
    "stores_id" INTEGER NOT NULL,
    "product_url" TEXT NOT NULL,
    "current_price" DECIMAL(12,2),
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_stores_pkey" PRIMARY KEY ("products_id","stores_id","id")
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

-- CreateIndex
CREATE UNIQUE INDEX "monitors_type_key" ON "monitors"("type");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_style_code_key" ON "products"("style_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_stores_product_url_key" ON "products_stores"("product_url");

-- CreateIndex
CREATE UNIQUE INDEX "stores_name_key" ON "stores"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stores_url_key" ON "stores"("url");

-- AddForeignKey
ALTER TABLE "html_selectors" ADD CONSTRAINT "html_selectors_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitors_products" ADD CONSTRAINT "monitors_products_monitors_id_fkey" FOREIGN KEY ("monitors_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitors_products" ADD CONSTRAINT "monitors_products_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitors_products" ADD CONSTRAINT "monitors_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_stores" ADD CONSTRAINT "products_stores_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_stores" ADD CONSTRAINT "products_stores_stores_id_fkey" FOREIGN KEY ("stores_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
