type TYear = `${1 | 2}${number}${number}${number}`;
type TMonth = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';
type TDay =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24'
  | '25'
  | '26'
  | '27'
  | '28'
  | '29'
  | '30'
  | '31';

/**
 * Represent a string like `2021-01-08`
 */
export type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

/**
 * Represent a string like `27/10/2024`
 */
export type TDatePTBRDate = `${TDay}/${TMonth}/${TYear}`;
