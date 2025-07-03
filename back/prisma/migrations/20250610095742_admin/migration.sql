-- CreateEnum
CREATE TYPE "public"."AccessLevel" AS ENUM ('NONE', 'WRITE');

-- CreateEnum
CREATE TYPE "public"."SalesOrderStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED_EMAIL_SENT', 'NEEDS_REVISION', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."FulfillmentStatus" AS ENUM ('READY', 'IN_PO');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('SALES_ORDER', 'FORGOT_PASSWORD_USER', 'FORGOT_PASSWORD_ADMIN');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventImage" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "Id" SERIAL NOT NULL,
    "Username" VARCHAR(30) NOT NULL,
    "Password" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(75) NOT NULL,
    "Token" VARCHAR(250),
    "Image" VARCHAR(255),
    "Name" VARCHAR(50),
    "Birthdate" TIMESTAMP(3),
    "PhoneNumber" VARCHAR(20),
    "Address" VARCHAR(150),
    "Gender" VARCHAR(10),
    "RoleId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."AdminSession" (
    "Id" SERIAL NOT NULL,
    "AdminId" INTEGER NOT NULL,
    "LoginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LogoutTime" TIMESTAMP(3),

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."AdminForgotPasswordRequest" (
    "Id" SERIAL NOT NULL,
    "AdminId" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "IsUsed" BOOLEAN NOT NULL DEFAULT false,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "SenderEmail" TEXT,
    "Status" "public"."EmailStatus" NOT NULL DEFAULT 'PENDING',
    "ErrorMessage" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EmailTemplateId" INTEGER,

    CONSTRAINT "AdminForgotPasswordRequest_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Sales" (
    "Id" SERIAL NOT NULL,
    "AdminId" INTEGER NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Dealer" (
    "Id" SERIAL NOT NULL,
    "CompanyName" TEXT NOT NULL,
    "Region" TEXT,
    "StoreCode" TEXT NOT NULL,
    "Address" TEXT,
    "PhoneNumber" TEXT,
    "fax" TEXT,
    "PriceCategoryId" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Name" TEXT,
    "Password" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "Token" TEXT,
    "Image" TEXT,
    "Address" TEXT,
    "Birthdate" TIMESTAMP(3),
    "Country" TEXT,
    "Gender" TEXT,
    "PhoneNumber" TEXT,
    "Province" TEXT,
    "DealerId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "LoginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LogoutTime" TIMESTAMP(3),
    "Token" TEXT,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."UserForgotPasswordRequest" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "IsUsed" BOOLEAN NOT NULL DEFAULT false,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "SenderEmail" TEXT,
    "Status" "public"."EmailStatus" NOT NULL DEFAULT 'PENDING',
    "ErrorMessage" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EmailTemplateId" INTEGER,

    CONSTRAINT "UserForgotPasswordRequest_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."AdminRole" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Path" TEXT NOT NULL,
    "Description" TEXT,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."MenuFeature" (
    "Id" SERIAL NOT NULL,
    "MenuId" INTEGER NOT NULL,
    "Feature" TEXT NOT NULL,

    CONSTRAINT "MenuFeature_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."RoleMenuAccess" (
    "Id" SERIAL NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "MenuId" INTEGER NOT NULL,
    "Access" "public"."AccessLevel" NOT NULL,

    CONSTRAINT "RoleMenuAccess_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."RoleMenuFeatureAccess" (
    "Id" SERIAL NOT NULL,
    "RoleId" INTEGER NOT NULL,
    "MenuFeatureId" INTEGER NOT NULL,
    "Access" "public"."AccessLevel" NOT NULL,

    CONSTRAINT "RoleMenuFeatureAccess_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "Id" SERIAL NOT NULL,
    "CartId" INTEGER NOT NULL,
    "ItemCodeId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "Id" SERIAL NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "PriceCategoryId" INTEGER,
    "DealerId" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "ItemCodeId" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."PriceCategory" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "PriceCategory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."WholesalePrice" (
    "Id" SERIAL NOT NULL,
    "MinQuantity" INTEGER NOT NULL,
    "MaxQuantity" INTEGER NOT NULL,
    "PriceId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "WholesalePrice_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "Id" SERIAL NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ItemCodeId" INTEGER NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CodeName" TEXT,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."PartNumber" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Dash" INTEGER,
    "InnerDiameter" DOUBLE PRECISION,
    "OuterDiameter" DOUBLE PRECISION,
    "WorkingPressure" DOUBLE PRECISION,
    "BurstingPressure" DOUBLE PRECISION,
    "BendingRadius" DOUBLE PRECISION,
    "HoseWeight" DOUBLE PRECISION,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "ProductId" INTEGER,

    CONSTRAINT "PartNumber_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ItemCode" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "Name" TEXT NOT NULL,
    "BrandCodeId" INTEGER,
    "OEM" TEXT,
    "Weight" DOUBLE PRECISION,
    "AllowItemCodeSelection" BOOLEAN NOT NULL DEFAULT false,
    "MinOrderQuantity" INTEGER,
    "QtyPO" DOUBLE PRECISION,
    "OrderStep" INTEGER,
    "PartNumberId" INTEGER,

    CONSTRAINT "ItemCode_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ItemCodeImage" (
    "Id" SERIAL NOT NULL,
    "Image" TEXT,
    "ItemCodeId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "ItemCodeImage_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "BusinessUnit" TEXT NOT NULL,
    "Location" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."WarehouseStock" (
    "Id" SERIAL NOT NULL,
    "WarehouseId" INTEGER NOT NULL,
    "ItemCodeId" INTEGER NOT NULL,
    "QtyOnHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "WarehouseStock_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."DealerWarehouse" (
    "Id" SERIAL NOT NULL,
    "DealerId" INTEGER NOT NULL,
    "WarehouseId" INTEGER NOT NULL,
    "Priority" INTEGER,

    CONSTRAINT "DealerWarehouse_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ProductBrand" (
    "Id" SERIAL NOT NULL,
    "ProductBrandName" TEXT,
    "ProductBrandCode" TEXT,

    CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "Id" SERIAL NOT NULL,
    "Image" TEXT,
    "ProductId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "ParentCategoryId" INTEGER,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategoryImage" (
    "Id" SERIAL NOT NULL,
    "Image" TEXT,
    "ProductCategoryId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductCategoryImage_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."StockHistory" (
    "Id" SERIAL NOT NULL,
    "WarehouseStockId" INTEGER,
    "ItemCodeId" INTEGER NOT NULL,
    "QtyBefore" DOUBLE PRECISION,
    "QtyAfter" DOUBLE PRECISION,
    "Note" TEXT,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UploadLogId" INTEGER,
    "AdminId" INTEGER,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."StockHistoryExcelUploadLog" (
    "Id" SERIAL NOT NULL,
    "FilePath" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistoryExcelUploadLog_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrder" (
    "Id" SERIAL NOT NULL,
    "SalesOrderNumber" TEXT,
    "JdeSalesOrderNumber" TEXT,
    "DealerId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SalesId" INTEGER NOT NULL,
    "Status" "public"."SalesOrderStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "Note" TEXT,
    "PaymentTerm" INTEGER,
    "FOB" TEXT,
    "CustomerPoNumber" TEXT,
    "DeliveryOrderNumber" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),
    "TransactionToken" TEXT NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrderDetail" (
    "Id" SERIAL NOT NULL,
    "SalesOrderId" INTEGER NOT NULL,
    "ItemCodeId" INTEGER NOT NULL,
    "WarehouseId" INTEGER,
    "Quantity" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "FinalPrice" DOUBLE PRECISION NOT NULL,
    "PriceCategoryId" INTEGER,
    "FulfillmentStatus" "public"."FulfillmentStatus" NOT NULL DEFAULT 'READY',
    "TaxId" INTEGER,

    CONSTRAINT "SalesOrderDetail_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Tax" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT,
    "Percentage" DOUBLE PRECISION NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3),
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrderFile" (
    "Id" SERIAL NOT NULL,
    "SalesOrderId" INTEGER NOT NULL,
    "ExcelFile" TEXT,
    "PdfFile" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3),

    CONSTRAINT "SalesOrderFile_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."EmailSalesOrder" (
    "Id" SERIAL NOT NULL,
    "SalesOrderId" INTEGER NOT NULL,
    "SenderEmail" TEXT,
    "RecipientEmail" TEXT NOT NULL,
    "Subject" TEXT NOT NULL,
    "Body" TEXT,
    "Status" "public"."EmailStatus" NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3),
    "DeletedAt" TIMESTAMP(3),
    "ApprovedAt" TIMESTAMP(3),
    "EmailTemplateId" INTEGER,

    CONSTRAINT "EmailSalesOrder_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."EmailSalesOrderRecipient" (
    "Id" SERIAL NOT NULL,
    "SalesId" INTEGER NOT NULL,
    "RecipientEmail" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "EmailSalesOrderRecipient_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."EmailConfig" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Host" TEXT NOT NULL DEFAULT 'smtp.gmail.com',
    "Port" INTEGER NOT NULL DEFAULT 465,
    "Secure" BOOLEAN NOT NULL DEFAULT true,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3),
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Subject" TEXT,
    "Body" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TemplateType" "public"."EmailTemplateType",
    "UpdatedAt" TIMESTAMP(3),
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."_DealerSales" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DealerSales_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ProductToProductCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductToProductCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Id_key" ON "public"."Admin"("Id");

-- CreateIndex
CREATE UNIQUE INDEX "AdminForgotPasswordRequest_Token_key" ON "public"."AdminForgotPasswordRequest"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "Sales_AdminId_key" ON "public"."Sales"("AdminId");

-- CreateIndex
CREATE UNIQUE INDEX "UserForgotPasswordRequest_Token_key" ON "public"."UserForgotPasswordRequest"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "RoleMenuAccess_RoleId_MenuId_key" ON "public"."RoleMenuAccess"("RoleId", "MenuId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleMenuFeatureAccess_RoleId_MenuFeatureId_key" ON "public"."RoleMenuFeatureAccess"("RoleId", "MenuFeatureId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_UserId_key" ON "public"."Cart"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseStock_WarehouseId_ItemCodeId_key" ON "public"."WarehouseStock"("WarehouseId", "ItemCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerWarehouse_DealerId_WarehouseId_key" ON "public"."DealerWarehouse"("DealerId", "WarehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrderFile_SalesOrderId_key" ON "public"."SalesOrderFile"("SalesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfig_Email_key" ON "public"."EmailConfig"("Email");

-- CreateIndex
CREATE INDEX "_DealerSales_B_index" ON "public"."_DealerSales"("B");

-- CreateIndex
CREATE INDEX "_ProductToProductCategory_B_index" ON "public"."_ProductToProductCategory"("B");

-- AddForeignKey
ALTER TABLE "public"."EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "public"."AdminRole"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminSession" ADD CONSTRAINT "AdminSession_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "public"."Admin"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminForgotPasswordRequest" ADD CONSTRAINT "AdminForgotPasswordRequest_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES "public"."EmailTemplate"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminForgotPasswordRequest" ADD CONSTRAINT "AdminForgotPasswordRequest_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "public"."Admin"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sales" ADD CONSTRAINT "Sales_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "public"."Admin"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dealer" ADD CONSTRAINT "Dealer_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES "public"."PriceCategory"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES "public"."Dealer"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "public"."User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserForgotPasswordRequest" ADD CONSTRAINT "UserForgotPasswordRequest_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES "public"."EmailTemplate"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserForgotPasswordRequest" ADD CONSTRAINT "UserForgotPasswordRequest_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "public"."User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuFeature" ADD CONSTRAINT "MenuFeature_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES "public"."Menu"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleMenuAccess" ADD CONSTRAINT "RoleMenuAccess_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "public"."AdminRole"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleMenuAccess" ADD CONSTRAINT "RoleMenuAccess_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES "public"."Menu"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleMenuFeatureAccess" ADD CONSTRAINT "RoleMenuFeatureAccess_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "public"."AdminRole"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleMenuFeatureAccess" ADD CONSTRAINT "RoleMenuFeatureAccess_MenuFeatureId_fkey" FOREIGN KEY ("MenuFeatureId") REFERENCES "public"."MenuFeature"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "public"."User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "public"."Cart"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES "public"."PriceCategory"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES "public"."Dealer"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WholesalePrice" ADD CONSTRAINT "WholesalePrice_PriceId_fkey" FOREIGN KEY ("PriceId") REFERENCES "public"."Price"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceHistory" ADD CONSTRAINT "PriceHistory_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartNumber" ADD CONSTRAINT "PartNumber_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemCode" ADD CONSTRAINT "ItemCode_BrandCodeId_fkey" FOREIGN KEY ("BrandCodeId") REFERENCES "public"."ProductBrand"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemCode" ADD CONSTRAINT "ItemCode_PartNumberId_fkey" FOREIGN KEY ("PartNumberId") REFERENCES "public"."PartNumber"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemCodeImage" ADD CONSTRAINT "ItemCodeImage_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseStock" ADD CONSTRAINT "WarehouseStock_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseStock" ADD CONSTRAINT "WarehouseStock_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealerWarehouse" ADD CONSTRAINT "DealerWarehouse_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES "public"."Dealer"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealerWarehouse" ADD CONSTRAINT "DealerWarehouse_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategory" ADD CONSTRAINT "ProductCategory_ParentCategoryId_fkey" FOREIGN KEY ("ParentCategoryId") REFERENCES "public"."ProductCategory"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryImage" ADD CONSTRAINT "ProductCategoryImage_ProductCategoryId_fkey" FOREIGN KEY ("ProductCategoryId") REFERENCES "public"."ProductCategory"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_WarehouseStockId_fkey" FOREIGN KEY ("WarehouseStockId") REFERENCES "public"."WarehouseStock"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_UploadLogId_fkey" FOREIGN KEY ("UploadLogId") REFERENCES "public"."StockHistoryExcelUploadLog"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockHistory" ADD CONSTRAINT "StockHistory_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "public"."Admin"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES "public"."Dealer"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "public"."User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_SalesId_fkey" FOREIGN KEY ("SalesId") REFERENCES "public"."Sales"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderDetail" ADD CONSTRAINT "SalesOrderDetail_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES "public"."SalesOrder"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderDetail" ADD CONSTRAINT "SalesOrderDetail_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "public"."Warehouse"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderDetail" ADD CONSTRAINT "SalesOrderDetail_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES "public"."ItemCode"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderDetail" ADD CONSTRAINT "SalesOrderDetail_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES "public"."PriceCategory"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderDetail" ADD CONSTRAINT "SalesOrderDetail_TaxId_fkey" FOREIGN KEY ("TaxId") REFERENCES "public"."Tax"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderFile" ADD CONSTRAINT "SalesOrderFile_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES "public"."SalesOrder"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSalesOrder" ADD CONSTRAINT "EmailSalesOrder_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES "public"."SalesOrder"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSalesOrder" ADD CONSTRAINT "EmailSalesOrder_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES "public"."EmailTemplate"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSalesOrderRecipient" ADD CONSTRAINT "EmailSalesOrderRecipient_SalesId_fkey" FOREIGN KEY ("SalesId") REFERENCES "public"."Sales"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DealerSales" ADD CONSTRAINT "_DealerSales_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Dealer"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DealerSales" ADD CONSTRAINT "_DealerSales_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Sales"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCategory" ADD CONSTRAINT "_ProductToProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToProductCategory" ADD CONSTRAINT "_ProductToProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ProductCategory"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
