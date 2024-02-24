import { expect, it, jest } from '@jest/globals';
import { CommitPool } from '.';

const voters = ['sdf', 'xcv', 'wer', 'lkj', 'lkf'];
const doNothing = () => {};
const initialCommit = 'first';

it('Criar um novo CommitPool sem new retorna uma instancia', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(newPool).toBeInstanceOf(CommitPool);
});

it('Criar um novo commit com new retorna uma instancia', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(newPool).toBeInstanceOf(CommitPool);
});

it('A propriedade addToPool existe', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(newPool).toHaveProperty('addToPool');
});

it('addToPool é uma função', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(typeof newPool.addToPool).toBe('function');
});

it('A propriedade addVote existe', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(newPool).toHaveProperty('addVote');
});

it('addVote é uma função', () => {
  const newPool = CommitPool(doNothing, doNothing, voters, initialCommit);
  expect(typeof newPool.addToPool).toBe('function');
});

it('onAccepted é chamado quando um commit é aceito', () => {
  const onAccepted = jest.fn(() => {});
  const newPool = CommitPool(onAccepted, doNothing, voters, initialCommit);
  newPool.addToPool({
    type: 'a commit',
    data: {
      commitId: 'second',
      previousCommit: 'first',
      from: 'sdf',
    },
  });
  newPool.addVote({
    from: 'sdf',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'xcv',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'lkj',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  expect(onAccepted).toBeCalledTimes(1);
});

it('um commit só é aceito se referencial o commit atual no previous, mesmo tendo os votos', () => {
  const onAccepted = jest.fn(() => {});
  const newPool = CommitPool(onAccepted, doNothing, voters, initialCommit);
  newPool.addToPool({
    type: 'a commit',
    data: {
      commitId: 'second',
      previousCommit: 'notTheCurrent',
      from: 'sdf',
    },
  });
  newPool.addVote({
    from: 'sdf',
    in: {
      commitId: 'second',
      previousCommit: 'notTheCurrent',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'xcv',
    in: {
      commitId: 'second',
      previousCommit: 'notTheCurrent',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'lkj',
    in: {
      commitId: 'second',
      previousCommit: 'notTheCurrent',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  expect(onAccepted).not.toBeCalled();
});

it('onRejected é chamado quando um commit é rejeitado', () => {
  const onRejected = jest.fn(() => {});
  const newPool = CommitPool(
    doNothing,
    onRejected,
    ['a', 'b', 'c'],
    initialCommit,
  );
  newPool.addToPool({
    type: 'a commit',
    data: {
      commitId: 'second',
      previousCommit: 'first',
      from: 'a',
    },
  });
  newPool.addVote({
    from: 'a',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'accepted',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'b',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'rejected',
  });
  newPool.checkVotes('second');
  newPool.addVote({
    from: 'c',
    in: {
      commitId: 'second',
      previousCommit: 'first',
    },
    vote: 'rejected',
  });
  newPool.checkVotes('second');
  expect(onRejected).toBeCalledTimes(1);
});

// it('A propriedade onBlocked existe', () => {
//   const newPool = CommitPool(doNothing, voters, initialCommit);
//   expect(newPool).toHaveProperty('onBlocked');
// });

// it('onBlocked é uma função', () => {
//   const newPool = CommitPool(doNothing, voters, initialCommit);
//   expect(typeof newPool.onBlocked).toBe('function');
// });

// it('onBlocked é chamado quando há um empate na votação', () => {
//   const onBlocked = jest.fn(() => {});
//   const newPool = CommitPool(
//     doNothing,
//     ['sdf', 'xcv', 'wer', 'lkj'],
//     initialCommit,
//   );
//   newPool.addToPool({
//     type: 'a commit',
//     data: {
//       id: 'second',
//       previous: 'first',
//     },
//   });
//   newPool.addToPool({
//     type: 'a commit',
//     data: {
//       id: 'stalle',
//       previous: 'first',
//     },
//   });
//   newPool.addVote({
//     from: 'sdf',
//     in: {
//       id: 'second',
//       previous: 'first',
//     },
//     vote: 'accepted',
//   });
//   newPool.addVote({
//     from: 'xcv',
//     in: {
//       id: 'stalle',
//       previous: 'first',
//     },
//     vote: 'accepted',
//   });
//   expect(onBlocked).toBeCalledTimes(1);
// });