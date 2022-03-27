/*
  Warnings:

  - You are about to drop the `html_selectors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `products_stores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "html_selectors" DROP CONSTRAINT "html_selectors_store_id_fkey";

-- DropTable
DROP TABLE "html_selectors";

-- CreateTable
CREATE TABLE "products_stores_sneakers_stock" (
    "id" BIGSERIAL NOT NULL,
    "products_stores_id" BIGINT NOT NULL,
    "size" SMALLINT NOT NULL,
    "stock" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_stores_sneakers_stock_pkey" PRIMARY KEY ("id","products_stores_id","size")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_stores_sneakers_stock_id_key" ON "products_stores_sneakers_stock"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_stores_id_key" ON "products_stores"("id");

-- AddForeignKey
ALTER TABLE "products_stores_sneakers_stock" ADD CONSTRAINT "products_stores_sneakers_stock_products_stores_id_fkey" FOREIGN KEY ("products_stores_id") REFERENCES "products_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
