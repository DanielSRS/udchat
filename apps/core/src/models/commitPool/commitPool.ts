import { Commit } from '../commit';

/**
 * Commits aguardam a votação para decidir qual deles vai ser inserido no historico
 * Todos os commits precisam referenciar o commit mais recente.
 */
export interface CommitPool {
  /**
   * Adiciona um novo commit
   */
  addToPool: (
    commit: Commit<string, { id: string; previous: string; from: string }>,
  ) => void;
  /**
   * Adiciona o voto de um dos membros
   */
  addVote: (vote: {
    /** username de quem votou */
    from: string;
    /** Um votante pode escolher aceitar ou rejeitar um commit */
    vote: 'accepted' | 'rejected';
    /** Commit para adicionar o voto */
    in: {
      id: string;
      previous: string;
    };
  }) => void;
}

interface PrivateCommitPool {
  /** Id do commit mais recente */
  currentCommit: string;
  onAcceptCallback: OnAcceptedCallback;
  OnBlockedCallback: OnBlockedCallback;
  OnRejectedallback: OnRejectedCallback;
  voters: string[];
  commitsInVoting: Record<string, PoolEntry>;
  majorityCount: number;
  removeCommitEntry: (noMoreValidCommitId: string) => void;
  checkIfItsStale: () => void;
}

interface CommitPoolFunction {
  new (
    onAccepted: OnAcceptedCallback,
    onRejected: OnRejectedCallback,
    // onBlocked: OnBlockedCallback,
    voters: Voters,
    currentCommitId: string,
  ): CommitPool;
  (
    onAccepted: OnAcceptedCallback,
    onRejected: OnRejectedCallback,
    // onBlocked: OnBlockedCallback,
    voters: Voters,
    currentCommitId: string,
  ): CommitPool;
}

interface Voters extends Array<string> {}
interface OnAcceptedResponse {
  commit: Commit<string, { id: string; previous: string }>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}
interface OnBlockedResponse {
  commit: Commit<string, { id: string; previous: string }>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}
interface OnRejectedResponse {
  commit: Commit<string, { id: string; previous: string }>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}
interface OnRejectedCallback {
  (res: OnRejectedResponse): void;
}
interface OnBlockedCallback {
  (res: OnBlockedResponse): void;
}
/**
 * Commit aceito para ser inserido no histórico
 */
interface OnAcceptedCallback {
  (res: OnAcceptedResponse): void;
}

interface PoolEntry {
  commit: Commit<string, { id: string; previous: string; from: string }>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}

const _CommitPool = function CommitPool(
  onAccepted,
  onRejected,
  // onBlocked,
  voters,
  currentCommitId,
) {
  // Called as normal function (without new)
  if (!new.target) {
    const CommitPoolWithNew = CommitPool as CommitPoolFunction;
    return new CommitPoolWithNew(
      onAccepted,
      onRejected,
      // onBlocked,
      voters,
      currentCommitId,
    );
  }

  // Called as a constructor (with new)
  // @ts-ignore
  const self = this as CommitPool & PrivateCommitPool;

  self.currentCommit = currentCommitId;
  self.onAcceptCallback = onAccepted;
  self.voters = voters;
  self.commitsInVoting = {};
  self.majorityCount = calcMinimumVotesToAccept(voters.length);
  self.OnRejectedallback = onRejected;
  // self.OnBlockedCallback = onBlocked;

  /**
   * This do not work
   */
  self.checkIfItsStale = function () {
    const withSameVoteCount: Record<string, string[]> = {};

    // agrupa commits com mesma contagem de votos
    // e que referenciam o commit atual
    Object.entries(self.commitsInVoting).map(en => {
      const key = en[0];
      const value = en[1];
      const voteCount = value.votes.accepted.length.toString();
      const toCurrentCommit = self.currentCommit === value.commit.data.previous;
      if (!toCurrentCommit) {
        return;
      }

      const group = withSameVoteCount[voteCount];
      if (group) {
        group.push(key);
      } else {
        withSameVoteCount[voteCount] = [key];
      }
    });

    // remove contagens que não tem mais de um commit
    Object.entries(withSameVoteCount).map(en => {
      const key = en[0];
      const value = en[1];
      const isOnlyOne = value.length > 1;

      if (isOnlyOne) {
        delete withSameVoteCount[key];
      }
    });

    // Verifica se não tem faltando votar
    Object.entries(withSameVoteCount).map(en => {
      // const key = en[0];
      const value = en[1];
      const numberOfMissingVotes = value.length;
      const commits = value
        .map(c => self.commitsInVoting[c])
        .filter(v => !!v) as PoolEntry[];
      const missingVoters = value
        .map(c => self.commitsInVoting[c]?.commit.data.from)
        .filter(v => !!v) as string[];

      const found = (targetArray: string[]) =>
        targetArray.some(elem => missingVoters.includes(elem));

      const noMissingVoters = commits
        .map(c => {
          const allVoters = [...c.votes.accepted, ...c.votes.rejected];
          const missingVotersCount = self.voters.length - allVoters.length;
          if (numberOfMissingVotes !== missingVotersCount) {
            return false;
          }
          return !found(allVoters);
        })
        .reduce((p, c) => p && c, true);

      if (noMissingVoters) {
        commits.map(self.OnBlockedCallback);
      }
    });
  };

  self.removeCommitEntry = function (noMoreValidCommitId) {
    // removo todo mundo que referenciava o commit antigo
    const toBeRemoved = Object.entries(self.commitsInVoting)
      .map(en => {
        const key = en[0];
        const entry = en[1];

        // se for um commit invali/ultrapassado
        const isToRemove = entry.commit.data.previous === noMoreValidCommitId;

        // add pra lista de remoção
        if (isToRemove) {
          return key;
        }
        return undefined;
      })
      .filter(v => !!v) as string[];

    toBeRemoved.forEach(c => self.removeCommitEntry(c));
    toBeRemoved.forEach(c => {
      delete self.commitsInVoting[c];
    });
  };

  self.addToPool = function (commit) {
    // alread in, do nothing
    if (this.commitsInVoting[commit.data.id]) {
      return;
    }
    // if follows current commit
    if (commit.data.previous === this.currentCommit) {
      this.commitsInVoting[commit.data.id] = {
        commit,
        votes: {
          accepted: [],
          rejected: [],
        },
      };
      return;
    }
    // if follows another pending commit
    if (this.commitsInVoting[commit.data.previous]) {
      this.commitsInVoting[commit.data.id] = {
        commit,
        votes: {
          accepted: [],
          rejected: [],
        },
      };
      return;
    }
    // do not add commit
  };

  self.addVote = function (vote) {
    const commitTV = self.commitsInVoting[vote.in.id];
    // Se não exite um commit a ser votado
    if (!commitTV) {
      return;
    }

    // Remove voto se ja tinha votado antes
    const voter = vote.from;
    commitTV.votes.accepted = commitTV.votes.accepted.filter(v => v !== voter);
    commitTV.votes.rejected = commitTV.votes.rejected.filter(v => v !== voter);

    // computa o voto
    if (vote.vote === 'accepted') {
      commitTV.votes.accepted.push(vote.from);
    }
    if (vote.vote === 'rejected') {
      commitTV.votes.rejected.push(vote.from);
    }

    // checa se tem votos suficientes
    const acceptedCount = commitTV.votes.accepted.length;
    const rejectedCount = commitTV.votes.rejected.length;
    const accepted = acceptedCount >= this.majorityCount;
    const rejected = rejectedCount >= this.majorityCount;

    // se aceito
    if (accepted && commitTV.commit.data.previous === this.currentCommit) {
      // dispara o alerta
      this.onAcceptCallback(commitTV);
      // deleta o aceito para não causar problemas pq outros commits
      // que referenciam ele ainda poder estar sendo votados
      delete self.commitsInVoting[commitTV.commit.data.id];

      // deleta todo mundo que passou a ser invalido
      self.removeCommitEntry(self.currentCommit);

      // atualiza o commit atual
      self.currentCommit = commitTV.commit.data.id;
    }

    // se rejeitado
    if (rejected) {
      // dispara o alerta
      this.OnRejectedallback(commitTV);
      // deleta o commit e todo mundo que passou depende dele
      self.removeCommitEntry(self.currentCommit);
    }
  };
} as CommitPoolFunction;

/**
 * Calcula a quantidade de votos minima para aceitar um commit
 * de acordo com a quantidade de votantes
 */
const calcMinimumVotesToAccept = (votersCount: number) => {
  const isEven = votersCount % 2 === 0;
  const halfOfVoters = (isEven ? votersCount : votersCount - 1) / 2;
  const majority = halfOfVoters + 1;
  return majority;
};

export { _CommitPool as CommitPool };
