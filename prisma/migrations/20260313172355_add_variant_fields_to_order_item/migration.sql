-- AlterTable: drop old composite PK, add new columns, add new PK
ALTER TABLE "OrderItem" DROP CONSTRAINT "orderitems_orderId_productId_pk";

ALTER TABLE "OrderItem"
ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN "variantId" UUID,
ADD COLUMN "color" TEXT,
ADD COLUMN "size" TEXT;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");
