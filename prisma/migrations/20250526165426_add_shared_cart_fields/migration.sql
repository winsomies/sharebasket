-- CreateTable
CREATE TABLE "SharedCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedCart_shareId_key" ON "SharedCart"("shareId");
