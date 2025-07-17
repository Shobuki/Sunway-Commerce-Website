-- AlterTable
ALTER TABLE "public"."AdminNotification" ADD COLUMN     "DeletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."AdminNotification" ADD CONSTRAINT "AdminNotification_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES "public"."SalesOrder"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
