/*
  Warnings:

  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brand",
DROP COLUMN "condition",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "Condition";

-- DropEnum
DROP TYPE "ProductStatus";
