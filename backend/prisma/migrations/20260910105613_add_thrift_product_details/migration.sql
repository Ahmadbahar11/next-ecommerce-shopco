-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "authenticityVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionNotes" TEXT,
ADD COLUMN     "defectNotes" TEXT,
ADD COLUMN     "includesOriginalBox" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insoleLengthMm" INTEGER;
