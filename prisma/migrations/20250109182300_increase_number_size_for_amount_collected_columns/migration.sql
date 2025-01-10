-- AlterTable
ALTER TABLE "loterias" ALTER COLUMN "valor_arrecadado" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_acumulado_concurso_0_5" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_acumulado_concurso_especial" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_acumulado_proximo_concurso" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_estimado_proximo_concurso" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_saldo_reserva_garantidora" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "valor_total_premio_faixa_um" SET DATA TYPE DECIMAL(14,2);
