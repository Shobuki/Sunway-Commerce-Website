/*
  Warnings:

  - You are about to alter the column `Token` on the `AdminForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `SenderEmail` on the `AdminForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(75)`.
  - You are about to alter the column `ErrorMessage` on the `AdminForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `CompanyName` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Region` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `StoreCode` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `Address` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `PhoneNumber` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `fax` on the `Dealer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `Token` on the `UserForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `SenderEmail` on the `UserForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(75)`.
  - You are about to alter the column `ErrorMessage` on the `UserForgotPasswordRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `Token` on the `UserSession` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "public"."AdminForgotPasswordRequest" ALTER COLUMN "Token" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "SenderEmail" SET DATA TYPE VARCHAR(75),
ALTER COLUMN "ErrorMessage" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."Dealer" ALTER COLUMN "CompanyName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "Region" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "StoreCode" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "Address" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "PhoneNumber" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "fax" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."UserForgotPasswordRequest" ALTER COLUMN "Token" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "SenderEmail" SET DATA TYPE VARCHAR(75),
ALTER COLUMN "ErrorMessage" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."UserSession" ALTER COLUMN "Token" SET DATA TYPE VARCHAR(100);
