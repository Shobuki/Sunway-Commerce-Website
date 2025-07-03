/*
  Warnings:

  - You are about to alter the column `Name` on the `AdminRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `Description` on the `AdminRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Name` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `Path` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Description` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Feature` on the `MenuFeature` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - A unique constraint covering the columns `[MenuId,Feature]` on the table `MenuFeature` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."AdminRole" ALTER COLUMN "Name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "Description" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."Menu" ALTER COLUMN "Name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "Path" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "Description" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."MenuFeature" ALTER COLUMN "Feature" SET DATA TYPE VARCHAR(80);

-- CreateIndex
CREATE UNIQUE INDEX "MenuFeature_MenuId_Feature_key" ON "public"."MenuFeature"("MenuId", "Feature");
