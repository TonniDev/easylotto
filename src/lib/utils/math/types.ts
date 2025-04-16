export interface GetEvenOrOddNumbersFromXToY {
  range?: [number, number];
  type?: 'even' | 'odd'
}
export interface AddNumbersToSetArgs {
  currList: number[];
  pool: number[];
  maxAmount: number;
  prevNumTypeFilterFunc?: (num: number | string) => boolean;
  currNumTypeFilterFunc?: (num: number | string) => boolean;
}

export interface Constraints {
  even: number | null;
  odd: number | null;
  prime: number | null;
  fibonacci: number | null;
  multipleOf3: number | null;
}

export type PossibleConstraints = Partial<Constraints>;

export interface GenerateRandomSetsOptions {
  amountOfSets?: number;
  itemsInSet?: number;
  constraints?: PossibleConstraints;
  startEnd?: number[];
}

export interface BacktrackArgs {
  currentConstraints: Constraints;
  maxPossibleCounts: Constraints;
  remainingNumbers: number[];
  remainingTotal: number;
}

export interface InitializeConstraintsReturn {
  numbersInRange: number[];
  maxPossibleCounts: Constraints;
  initialConstraints: Constraints;
}
