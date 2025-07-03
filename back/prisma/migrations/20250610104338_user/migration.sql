/*
  Warnings:

  - You are about to alter the column `Email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(75)`.
  - You are about to alter the column `Name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `Password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `Token` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `Image` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `Address` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `Country` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `Gender` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `PhoneNumber` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `Province` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "Email" SET DATA TYPE VARCHAR(75),
ALTER COLUMN "Name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "Password" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "Username" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "Token" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "Image" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "Address" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "Country" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "Gender" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "PhoneNumber" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "Province" SET DATA TYPE VARCHAR(30);
