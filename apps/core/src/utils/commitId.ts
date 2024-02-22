import { generateRandomInteger } from './randomInteger';

export const generateCommitId = () => {
  const commitId = `${new Date().getTime().toString(36)}${generateRandomInteger(
    1234506789,
    9876054321,
  ).toString(36)}${new Date().getTime().toString(36)}`;
  return commitId;
};
