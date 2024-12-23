CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CreateEnum
CREATE TYPE "EFaixa" AS ENUM ('15 acertos', '14 acertos', '13 acertos', '12 acertos', '11 acertos');

-- CreateTable
CREATE TABLE "loterias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "acumulado" BOOLEAN NOT NULL,
    "data_apuracao" VARCHAR(10) NOT NULL,
    "data_proximo_concurso" VARCHAR(10) NOT NULL,
    "dezenas_sorteadas_ordem_sorteio" TEXT[],
    "exibir_detalhamento_por_cidade" BOOLEAN NOT NULL,
    "indicador_concurso_especial" INTEGER NOT NULL,
    "lista_dezenas" TEXT[],
    "lista_dezenas_segundo_sorteio" TEXT[],
    "local_sorteio" VARCHAR(255) NOT NULL,
    "nome_municipio_uf_sorteio" VARCHAR(255) NOT NULL,
    "nome_time_coracao_mes_sorte" VARCHAR(255) NOT NULL,
    "numero" INTEGER NOT NULL,
    "numero_concurso_anterior" INTEGER NOT NULL,
    "numero_concurso_final_0_5" INTEGER NOT NULL,
    "numero_concurso_proximo" INTEGER NOT NULL,
    "numero_jogo" INTEGER NOT NULL,
    "observacao" TEXT NOT NULL,
    "tipo_jogo" VARCHAR(255) NOT NULL,
    "tipo_publicacao" INTEGER NOT NULL,
    "ultimo_concurso" BOOLEAN NOT NULL,
    "valor_arrecadado" DECIMAL(10,2) NOT NULL,
    "valor_acumulado_concurso_0_5" DECIMAL(10,2) NOT NULL,
    "valor_acumulado_concurso_especial" DECIMAL(10,2) NOT NULL,
    "valor_acumulado_proximo_concurso" DECIMAL(10,2) NOT NULL,
    "valor_estimado_proximo_concurso" DECIMAL(10,2) NOT NULL,
    "valor_saldo_reserva_garantidora" DECIMAL(10,2) NOT NULL,
    "valor_total_premio_faixa_um" DECIMAL(10,2) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loterias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "descricao_faixa" "EFaixa" NOT NULL,
    "faixa" INTEGER NOT NULL,
    "numero_de_ganhadores" INTEGER NOT NULL,
    "valor_premio" INTEGER NOT NULL,
    "concurso" INTEGER NOT NULL,
    "loteria_id" UUID NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "ganhadores" INTEGER NOT NULL,
    "municipio" VARCHAR(255) NOT NULL,
    "nome_fantasia_ul" VARCHAR(255) NOT NULL,
    "posicao" INTEGER NOT NULL,
    "serie" VARCHAR(255) NOT NULL,
    "uf" VARCHAR(255) NOT NULL,
    "concurso" INTEGER NOT NULL,
    "loteria_id" UUID NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_loteria_id_fkey" FOREIGN KEY ("loteria_id") REFERENCES "loterias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_loteria_id_fkey" FOREIGN KEY ("loteria_id") REFERENCES "loterias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
