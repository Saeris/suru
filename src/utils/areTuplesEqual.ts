export const areTuplesEqual = (tupleA: unknown[], tupleB: unknown[]): boolean => {
  if (tupleA.length !== tupleB.length) {
    return false;
  }
  return tupleA.every((valueA, indexA) => valueA === tupleB[indexA]);
};
