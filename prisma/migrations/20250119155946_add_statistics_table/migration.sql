-- DropIndex
DROP INDEX "loterias_id_idx";

-- CreateTable
CREATE TABLE "statistics" (
    "statKey" VARCHAR(255) NOT NULL,
    "value" INTEGER NOT NULL,
    "games" TEXT[],

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("statKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "statistics_statKey_key" ON "statistics"("statKey");

-- CreateIndex
CREATE INDEX "statistics_statKey_idx" ON "statistics"("statKey");

-- CreateIndex
CREATE INDEX "loterias_id_numero_idx" ON "loterias"("id", "numero");
