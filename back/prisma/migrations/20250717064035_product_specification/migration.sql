-- CreateTable
CREATE TABLE "public"."ProductSpecificationFile" (
    "Id" SERIAL NOT NULL,
    "ProductId" INTEGER NOT NULL,
    "FileName" TEXT NOT NULL,
    "FilePath" TEXT NOT NULL,
    "MimeType" TEXT NOT NULL,
    "UploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductSpecificationFile_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "public"."ProductSpecificationFile" ADD CONSTRAINT "ProductSpecificationFile_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "public"."Product"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
