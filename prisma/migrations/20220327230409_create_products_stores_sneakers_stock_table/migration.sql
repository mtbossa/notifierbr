/*
  Warnings:

  - You are about to drop the `monitors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `monitors_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "monitors_products" DROP CONSTRAINT "monitors_products_monitors_id_fkey";

-- DropForeignKey
ALTER TABLE "monitors_products" DROP CONSTRAINT "monitors_products_products_id_fkey";

-- DropForeignKey
ALTER TABLE "monitors_products" DROP CONSTRAINT "monitors_products_store_id_fkey";

-- DropTable
DROP TABLE "monitors";

-- DropTable
DROP TABLE "monitors_products";
