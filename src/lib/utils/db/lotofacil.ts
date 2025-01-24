import {Lotofacil, mapFaixaStringToEFaixa} from "@lib/definitions/lotofacil";
import {prisma} from "@lib/prisma";
import {generateKeyByAttributesCount, upsertStatistics} from "@lib/utils/cron/helpers";

export interface CreateLotofacilReturn {
  id: string | null;
  gameNumber: number;
  statistics: {
    occurrences: number,
    combinationKey: string,
  }[];
  error: Error | null;
}

function removeNullBytes(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\x00/g, '');
}

export function getPrizesDataFromItem(itemData: Lotofacil) {
  return (itemData.listaRateioPremio ?? []).map((p) => ({
    descricao_faixa: mapFaixaStringToEFaixa(p.descricaoFaixa),
    faixa: p.faixa,
    numeroDeGanhadores: p.numeroDeGanhadores,
    valorPremio: p.valorPremio,
    concurso: itemData.numero,
  }))
}

export function getWinnersDataFromItem(itemData: Lotofacil) {
  return (itemData.listaMunicipioUFGanhadores ?? []).map((w) => ({
    ganhadores: w.ganhadores,
    municipio: w.municipio,
    nomeFantasiaUL: w.nomeFatansiaUL,
    posicao: w.posicao,
    serie: w.serie,
    uf: w.uf,
    concurso: itemData.numero,
  }));
}

export function mountItemData(itemData: Lotofacil) {

  return {
    acumulado: itemData.acumulado ?? false,
    dataApuracao: itemData.dataApuracao ?? '',
    dataProximoConcurso: itemData.dataProximoConcurso ?? '',
    dezenasSorteadasOrdemSorteio: itemData.dezenasSorteadasOrdemSorteio ?? [],
    exibirDetalhamentoPorCidade: itemData.exibirDetalhamentoPorCidade ?? false,
    indicadorConcursoEspecial: itemData.indicadorConcursoEspecial ?? 0,
    listaDezenas: itemData.listaDezenas ?? [],
    listaDezenasSegundoSorteio: itemData.listaDezenasSegundoSorteio ?? [],
    localSorteio: itemData.localSorteio ?? '',
    nomeMunicipioUFSorteio: itemData.nomeMunicipioUFSorteio ?? '',
    nomeTimeCoracaoMesSorte: removeNullBytes(itemData.nomeTimeCoracaoMesSorte) ?? '',
    numero: itemData.numero ?? 0,
    numeroConcursoAnterior: itemData.numeroConcursoAnterior ?? 0,
    numeroConcursoFinal_0_5: itemData.numeroConcursoFinal_0_5 ?? 0,
    numeroConcursoProximo: itemData.numeroConcursoProximo ?? 0,
    numeroJogo: itemData.numeroJogo ?? 0,
    observacao: itemData.observacao ?? '',
    tipoJogo: itemData.tipoJogo ?? '',
    tipoPublicacao: itemData.tipoPublicacao ?? 0,
    ultimoConcurso: itemData.ultimoConcurso ?? false,
    valorArrecadado: itemData.valorArrecadado ?? 0,
    valorAcumuladoConcurso_0_5: itemData.valorAcumuladoConcurso_0_5 ?? 0,
    valorAcumuladoConcursoEspecial: itemData.valorAcumuladoConcursoEspecial ?? 0,
    valorAcumuladoProximoConcurso: itemData.valorAcumuladoProximoConcurso ?? 0,
    valorEstimadoProximoConcurso: itemData.valorEstimadoProximoConcurso ?? 0,
    valorSaldoReservaGarantidora: itemData.valorSaldoReservaGarantidora ?? 0,
    valorTotalPremioFaixaUm: itemData.valorTotalPremioFaixaUm ?? 0,
    listaRateioPremio: {
      create: getPrizesDataFromItem(itemData),
    },
    listaMunicipioUFGanhadores: {
      create: getWinnersDataFromItem(itemData),
    },
  };
}

export async function upsertStatistic(key: string, gameNumber: number) {
  try {
    return await prisma.statistics.upsert({
      where: {
        statKey: key,
      },
      update: {
        value: { increment: 1 },
        games: { push: String(gameNumber) },
      },
      create: {
        statKey: key,
        value: 1,
        games: [String(gameNumber)],
      }
    });
  } catch (error: any) {
    throw error;
  }
}

export async function createLotofacil(itemData: Lotofacil): Promise<CreateLotofacilReturn> {
  try {

    const savedItem = await prisma.loterias.create({
      data: mountItemData(itemData),
    });

    const statistics = await upsertStatistics(savedItem.listaDezenas, savedItem.numero);

    return {
      id: savedItem.id,
      gameNumber: savedItem.numero,
      statistics,
      error: null,
    }
  } catch (error: any) {
    throw { id: null, gameNumber: itemData.numero, error: error.message };
  }
}
