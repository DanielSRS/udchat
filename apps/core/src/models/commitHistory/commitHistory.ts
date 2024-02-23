import { BaseCommitData, Commit } from '../commit';

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
  addToHistory: <T extends string, K extends BaseCommitData>(
    newCommit: Commit<T, K>,
  ) => boolean;
  /**
   * Obtem o commit mais recente
   */
  getLatest: () => Commit<string, BaseCommitData> | undefined;
}

interface PrivateCommitHistory {
  /**
   * Id do commit mais recente
   *
   * É undefined se o histórico não tiver nenhum commit
   */
  latestCommit: string | undefined;

  /** Todos os commits do historico */
  commits: Record<string, Commit<string, BaseCommitData>>;
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
      ids.push(current.data.commitId);
      current = this.commits[current.data.previousCommit];
    }
    return ids.reverse();
  };

  self.addToHistory = function (commit) {
    if (!this.latestCommit) {
      this.latestCommit = commit.data.commitId;
      this.commits[commit.data.commitId] = commit;
      return true;
    }
    /** New commit do not respects order */
    if (this.latestCommit !== commit.data.previousCommit) {
      return false;
    }
    this.latestCommit = commit.data.commitId;
    this.commits[commit.data.commitId] = commit;
    return true;
  };

  self.getLatest = function () {
    const latestCommit = self.latestCommit || '';
    const commit = self.commits[latestCommit];
    return commit;
  };
} as CommitHistoryFunction;
