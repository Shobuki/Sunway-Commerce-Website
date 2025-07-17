-- CreateTable
CREATE TABLE "public"."AdminNotification" (
    "Id" SERIAL NOT NULL,
    "AdminId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Body" TEXT,
    "Path" TEXT,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SalesOrderId" INTEGER,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "public"."AdminNotification" ADD CONSTRAINT "AdminNotification_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "public"."Admin"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
