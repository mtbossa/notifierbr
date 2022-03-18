export const arrayDifference = <T>(
  incomeArray: Array<T>,
  compareArray: Array<T>,
): Array<T> => incomeArray.filter((x) => !compareArray.includes(x));
