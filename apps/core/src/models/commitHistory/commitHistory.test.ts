import { expect, it } from '@jest/globals';
import { CommitHistory } from '.';

it('Criar um novo CommitHistory sem new retorna uma instancia', () => {
  const novoHostoricoDeCommit = CommitHistory();
  expect(novoHostoricoDeCommit).toBeInstanceOf(CommitHistory);
});

it('Criar um novo commit com new retorna uma instancia', () => {
  const novoHostoricoDeCommit = new CommitHistory();
  expect(novoHostoricoDeCommit).toBeInstanceOf(CommitHistory);
});

it('A propriedade getOrderedIds existe', () => {
  const novoHostoricoDeCommit = CommitHistory();
  expect(novoHostoricoDeCommit).toHaveProperty('getOrderedIds');
});

it('getOrderedIds é uma função', () => {
  const novoHostoricoDeCommit = CommitHistory();
  expect(typeof novoHostoricoDeCommit.getOrderedIds).toBe('function');
});

it('A propriedade addToHistory existe', () => {
  const novoHostoricoDeCommit = CommitHistory();
  expect(novoHostoricoDeCommit).toHaveProperty('addToHistory');
});

it('addToHistory é uma função', () => {
  const novoHostoricoDeCommit = CommitHistory();
  expect(novoHostoricoDeCommit.addToHistory).toBeInstanceOf(Function);
});

it('getOrderedIds retorna um lista vazia se o historico for vazio', () => {
  const novoHostoricoDeCommit = CommitHistory();
  const res = novoHostoricoDeCommit.getOrderedIds();
  expect(res).toEqual([]);
});

it('getOrderedIds retorna o historico na ordem correta', () => {
  const novoHostoricoDeCommit = CommitHistory();
  novoHostoricoDeCommit.addToHistory({
    type: 'sometime',
    data: {
      id: 'first',
      previous: 'none',
    },
  });
  novoHostoricoDeCommit.addToHistory({
    type: 'asdlfjkl',
    data: {
      id: 'second',
      previous: 'first',
    },
  });
  novoHostoricoDeCommit.addToHistory({
    type: 'oirfnsdl',
    data: {
      id: 'third',
      previous: 'second',
    },
  });
  const hist = novoHostoricoDeCommit.getOrderedIds();
  expect(hist).toEqual(['first', 'second', 'third']);
});

it('commit com mesmo id não pode ser inserido no historico', () => {
  const novoHostoricoDeCommit = CommitHistory();
  const sucess = novoHostoricoDeCommit.addToHistory({
    type: 'oirfnsdl',
    data: {
      id: 'third',
      previous: 'second',
    },
  });
  const failure = novoHostoricoDeCommit.addToHistory({
    type: 'oirfnsdl',
    data: {
      id: 'third',
      previous: 'second',
    },
  });
  expect(sucess).toBe(true);
  expect(failure).toBe(false);
});

it('o id não pode se repetir no historico', () => {
  const novoHostoricoDeCommit = CommitHistory();
  novoHostoricoDeCommit.addToHistory({
    type: 'oirfnsdl',
    data: {
      id: 'third',
      previous: 'second',
    },
  });
  novoHostoricoDeCommit.addToHistory({
    type: 'oirfnsdl',
    data: {
      id: 'third',
      previous: 'second',
    },
  });
  const history = novoHostoricoDeCommit.getOrderedIds();
  expect(history).toEqual(['third']);
});
