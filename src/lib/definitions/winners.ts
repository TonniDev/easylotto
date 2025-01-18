export interface WinnersByState {
  state: string;
  totalWinners: number;
  percentage: number;
}

export interface Winners {
  totalWinners: number;
  totalGames: number;
  data: WinnersByState[];
}
