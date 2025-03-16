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
  even: number;
  odd: number;
  prime: number;
  fibonacci: number;
  multipleOf3: number;
}

export type PossibleConstraints = Partial<Constraints>;

export interface GenerateRandomSetsOptions {
  amountOfSets?: number,
  itemsInSet?: number,
  constraints: PossibleConstraints,
  startEnd?: [number, number];
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
