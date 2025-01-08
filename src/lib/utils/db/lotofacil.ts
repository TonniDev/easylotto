import {prisma} from "@lib/prisma";
import {Lotofacil, mapFaixaStringToEFaixa} from "@lib/definitions/lotofacil";

export async function createLotofacil(itemData: Lotofacil): Promise<string> {
  try {
    const prizesData = (itemData.listaRateioPremio ?? []).map((p) => ({
      descricao_faixa: mapFaixaStringToEFaixa(p.descricaoFaixa),
      faixa: p.faixa,
      numeroDeGanhadores: p.numeroDeGanhadores,
      valorPremio: p.valorPremio,
      concurso: itemData.numero,
    }));

    const winnersData = (itemData.listaMunicipioUFGanhadores ?? []).map((w) => ({
      ganhadores: w.ganhadores,
      municipio: w.municipio,
      nomeFantasiaUL: w.nomeFatansiaUL,
      posicao: w.posicao,
      serie: w.serie,
      uf: w.uf,
      concurso: itemData.numero,
    }));

    const savedItem = await prisma.loterias.create({
      data: {
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
        nomeTimeCoracaoMesSorte: itemData.nomeTimeCoracaoMesSorte ?? '',
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
          create: prizesData,
        },
        listaMunicipioUFGanhadores: {
          create: winnersData,
        },
      },
    });

    return `Item ${itemData.numero} inserted successfully with id ${savedItem.id}.`;
  } catch (error: any) {
    throw { id: itemData.numero, error: error.message };
  }
}
