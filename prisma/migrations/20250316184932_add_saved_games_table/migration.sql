-- CreateTable
CREATE TABLE "saved_games" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "lista_dezenas" TEXT[],
    "email" VARCHAR NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_games_id_key" ON "saved_games"("id");
