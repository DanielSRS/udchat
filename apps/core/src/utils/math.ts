/**
 * Calcula a quantidade de votos minima para aceitar um commit
 * de acordo com a quantidade de votantes
 */
export const calcMinimumVotesToAccept = (votersCount: number) => {
  const isEven = votersCount % 2 === 0;
  const halfOfVoters = (isEven ? votersCount : votersCount - 1) / 2;
  const majority = halfOfVoters > 0 ? halfOfVoters + 1 : 0;
  return majority;
};
