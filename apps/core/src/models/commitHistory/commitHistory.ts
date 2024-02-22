import { Commit } from '../commit';

/**
 * Mantém o registro de uma sequencia de commits
 * formando um histórico.
 *
 * Controla a adição de novos commits no histórico.
 */
export interface CommitHistory {
  /**
   * Obtem todos os ids dos commits com forma
   * de lista ordenada de acordo com o histórico de
   * inclusão
   */
  getOrderedIds: () => string[];

  /**
   * Adiciona um commit ao histórico, tornado-o o commit
   * mais recente.
   *
   * retorna false quando não referencia o commit atual (previous prop)
   * ou se o primeiro commit, previous não for 'none'
   */
  addToHistory: <T extends string, K extends { id: string; previous: string }>(
    newCommit: Commit<T, K>,
  ) => boolean;
}

interface PrivateCommitHistory {
  /**
   * Id do commit mais recente
   *
   * É undefined se o histórico não tiver nenhum commit
   */
  latestCommit: string | undefined;

  /** Todos os commits do historico */
  commits: Record<string, Commit<string, { id: string; previous: string }>>;
}

interface CommitHistoryFunction {
  new (): CommitHistory;
  (): CommitHistory;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export const CommitHistory = function CommitHistory() {
  // Called as normal function (without new)
  if (!new.target) {
    const CommmitWithNew = CommitHistory as CommitHistoryFunction;
    return new CommmitWithNew();
  }

  // Called as a constructor (with new)
  // @ts-ignore
  const self = this as CommitHistory & PrivateCommitHistory;

  self.latestCommit = undefined;
  self.commits = {};

  self.getOrderedIds = function () {
    if (!this.latestCommit) {
      return [];
    }
    let ids: string[] = [];
    let current = this.commits[this.latestCommit];
    while (current) {
      ids.push(current.data.id);
      current = this.commits[current.data.previous];
    }
    return ids.reverse();
  };

  self.addToHistory = function (commit) {
    if (!this.latestCommit) {
      this.latestCommit = commit.data.id;
      this.commits[commit.data.id] = commit;
      return true;
    }
    /** New commit do not respects order */
    if (this.latestCommit !== commit.data.previous) {
      return false;
    }
    this.latestCommit = commit.data.id;
    this.commits[commit.data.id] = commit;
    return true;
  };
} as CommitHistoryFunction;
