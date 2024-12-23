import {TDatePTBRDate} from "@lib/types";

type TLotofacilNumbers =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25";

export type TFaixa =
  | "15 acertos"
  | "14 acertos"
  | "13 acertos"
  | "12 acertos"
  | "11 acertos";

export interface UFGanhador {
  ganhadores: number;
  municipio: string;
  nomeFatansiaUL: string;
  posicao: number;
  serie: string;
  uf: string;
}

export interface RateioPremio {
  descricaoFaixa: TFaixa;
  faixa: number;
  numeroDeGanhadores: number;
  valorPremio: number;
}

export type Lotofacil = {
  acumulado: boolean;
  dataApuracao: TDatePTBRDate;
  dataProximoConcurso: TDatePTBRDate;
  dezenasSorteadasOrdemSorteio: TLotofacilNumbers[];
  exibirDetalhamentoPorCidade: true;
  id: null;
  indicadorConcursoEspecial: 1;
  listaDezenas: TLotofacilNumbers[];
  listaDezenasSegundoSorteio: null;
  listaMunicipioUFGanhadores: UFGanhador[];
  listaRateioPremio: RateioPremio[];
  listaResultadoEquipeEsportiva: null;
  localSorteio: string;
  nomeMunicipioUFSorteio: string;
  nomeTimeCoracaoMesSorte: string;
  numero: number;
  numeroConcursoAnterior: number;
  numeroConcursoFinal_0_5: number;
  numeroConcursoProximo: number;
  numeroJogo: number;
  observacao: string;
  premiacaoContingencia: null;
  tipoJogo: string;
  tipoPublicacao: number;
  ultimoConcurso: boolean;
  valorArrecadado: number;
  valorAcumuladoConcurso_0_5: number;
  valorAcumuladoConcursoEspecial: number;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  valorSaldoReservaGarantidora: number;
  valorTotalPremioFaixaUm: number;
};
