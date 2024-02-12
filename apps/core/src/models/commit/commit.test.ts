import { expect, it } from '@jest/globals';
import { Commit } from './commit';

const type = '12';
const data = { some: 'value' };

it('Criar um novo commit sem new retorna uma instancia', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit).toBeInstanceOf(Commit);
});

it('Criar um novo commit com new retorna uma instancia', () => {
  const novoCommit = new Commit(type, data);
  expect(novoCommit).toBeInstanceOf(Commit);
});

it('A propriedade type existe', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit).toHaveProperty('type');
});

it('type é uma string', () => {
  const novoCommit = Commit(type, data);
  expect(typeof novoCommit.type).toBe('string');
});

it('A propriedade data existe', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit).toHaveProperty('data');
});

it('data é um objeto', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit.data).toBeInstanceOf(Object);
});

it('type tem o mesmo valor passado no construtor', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit.type).toBe(type);
});

it('data tem o mesmo valor passado no construtor', () => {
  const novoCommit = Commit(type, data);
  expect(novoCommit.data).toBe(data);
});

it('Com os tipos explicitos', () => {
  const novoCommit = Commit<'dan', { none: null }>('dan', { none: null });
  expect(novoCommit).toBeInstanceOf(Commit);
});
