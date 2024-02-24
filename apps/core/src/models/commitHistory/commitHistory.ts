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
   * Obtem todos os commits em forma
   * de lista ordenada de acordo com o histórico de
   * inclusão
   */
  getInOrderCommits: () => Commit<string, BaseCommitData>[];

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

  readonly latestCommit: string;
  readonly firstCommit: string;
  readonly commits: Record<string, Commit<string, BaseCommitData>>;
}

interface PrivateCommitHistory {
  /**
   * Id do commit mais recente
   *
   * É undefined se o histórico não tiver nenhum commit
   */
  // latestCommit: string | undefined;
  /** Todos os commits do historico */
  // commits: Record<string, Commit<string, BaseCommitData>>;
  /**
   * primeiro commit
   */
  // firstCommit: string | undefined;
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
  self.firstCommit = undefined;
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

  self.getInOrderCommits = function () {
    if (!this.latestCommit) {
      return [];
    }
    let commits: Commit<string, BaseCommitData>[] = [];
    let current = this.commits[this.latestCommit];
    while (current) {
      commits.push(current);
      current = this.commits[current.data.previousCommit];
    }
    return commits.reverse();
  };

  self.addToHistory = function (commit) {
    if (!this.latestCommit) {
      this.latestCommit = commit.data.commitId;
      this.firstCommit = commit.data.commitId;
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

interface CH<T extends BaseCommitData> {
  readonly latestCommit: string;
  readonly firstCommit: string;
  readonly commits: Record<string, Commit<string, T>>;
}

export function getLatestCommit<T extends BaseCommitData>(
  commitHistory: CH<T>,
) {
  const latestCommit = commitHistory.latestCommit;
  const commit =
    commitHistory.commits[latestCommit] ||
    // Fazendo isso pq latestCommit sempre vai existir
    ({} as Commit<string, T>);
  return commit;
}

export function addCommiToHistory(
  previousCommitHistory: CH<BaseCommitData>,
  newCommit: Commit<string, BaseCommitData>,
): Readonly<CH<BaseCommitData>> {
  const commitHistory = { ...previousCommitHistory };
  // if (!this.latestCommit) {
  //   this.latestCommit = commit.data.commitId;
  //   this.firstCommit = commit.data.commitId;
  //   this.commits[commit.data.commitId] = commit;
  //   return true;
  // }
  /** New commit do not respects order */
  if (commitHistory.latestCommit !== newCommit.data.previousCommit) {
    return previousCommitHistory;
  }

  // atualiza o commit mais recente
  commitHistory.latestCommit = newCommit.data.commitId;
  commitHistory.commits[newCommit.data.commitId] = newCommit;
  return commitHistory;
}

export function getCommitById<T extends BaseCommitData>(
  commitHistory: CH<T>,
  commitId: string,
) {
  return commitHistory.commits[commitId];
}

export function getCommitsInOrder(commitHistory: CH<BaseCommitData>) {
  let commits: Commit<string, BaseCommitData>[] = [];
  let current: Commit<string, BaseCommitData> | undefined =
    getLatestCommit(commitHistory);
  while (current) {
    commits.push(current);
    current = getCommitById(commitHistory, current.data.previousCommit);
  }
  return commits.reverse();
}

export function getOrderedCommitIds(commitHistory: CH<BaseCommitData>) {
  let ids: string[] = [];
  let current: Commit<string, BaseCommitData> | undefined =
    getLatestCommit(commitHistory);
  while (current) {
    ids.push(current.data.commitId);
    current = getCommitById(commitHistory, current.data.previousCommit);
  }
  return ids.reverse();
}
