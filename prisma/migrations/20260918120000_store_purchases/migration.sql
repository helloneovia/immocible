-- Achats intégrés (App Store / Google Play) et origine des paiements.
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'stripe';

CREATE TABLE IF NOT EXISTS "store_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "plan" TEXT,
    "buyerId" TEXT,
    "transactionId" TEXT NOT NULL,
    "originalTransactionId" TEXT,
    "purchaseToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "environment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "store_purchases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "store_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "store_purchases_transactionId_key" ON "store_purchases"("transactionId");
CREATE INDEX IF NOT EXISTS "store_purchases_userId_idx" ON "store_purchases"("userId");
CREATE INDEX IF NOT EXISTS "store_purchases_originalTransactionId_idx" ON "store_purchases"("originalTransactionId");
CREATE INDEX IF NOT EXISTS "store_purchases_purchaseToken_idx" ON "store_purchases"("purchaseToken");
