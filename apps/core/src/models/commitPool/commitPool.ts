import { Either, right, left } from 'fp-ts/lib/Either';
import { BaseCommitData, Commit } from '../commit';
import { NEW_INGRESS_VOTE } from '../../contexts/organization/orgEventTypes';
import { calcMinimumVotesToAccept } from '../../utils/math';

/**
 * Commits aguardam a votação para decidir qual deles vai ser inserido no historico
 * Todos os commits precisam referenciar o commit mais recente.
 */
export interface CommitPool {
  /**
   * Adiciona um novo commit
   */
  addToPool: (commit: Commit<string, BaseCommitData>) => void;
  /**
   * Adiciona o voto de um dos membros
   */
  addVote: (vote: NEW_INGRESS_VOTE['data']) => void;
  /**
   * Undefined se são existe um commit com o id indicado ou não tem votos suficientes
   *
   * Left se o commit foi rejeitado
   * Right se o commit foi aceito
   */
  checkVotes: (commitId: string) => Either<PoolEntry, PoolEntry> | undefined;
  updateVoters: (newVoters: Voters) => void;
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
  commit: Commit<string, BaseCommitData>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}
interface OnBlockedResponse {
  commit: Commit<string, BaseCommitData>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}
interface OnRejectedResponse {
  commit: Commit<string, BaseCommitData>;
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
  commit: Commit<string, BaseCommitData>;
  votes: {
    accepted: string[];
    rejected: string[];
  };
}

export const CommitPool = (() => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const res = function CommitPool(
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
        const toCurrentCommit =
          self.currentCommit === value.commit.data.previousCommit;
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
          const isToRemove =
            entry.commit.data.previousCommit === noMoreValidCommitId;

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
      if (this.commitsInVoting[commit.data.commitId]) {
        return;
      }
      // if follows current commit
      if (commit.data.previousCommit === this.currentCommit) {
        this.commitsInVoting[commit.data.commitId] = {
          commit,
          votes: {
            accepted: [],
            rejected: [],
          },
        };
        return;
      }
      // if follows another pending commit
      if (this.commitsInVoting[commit.data.previousCommit]) {
        this.commitsInVoting[commit.data.commitId] = {
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
      const commitTV = self.commitsInVoting[vote.in.commitId];
      // Se não exite um commit a ser votado
      if (!commitTV) {
        return;
      }

      // Remove voto se ja tinha votado antes
      const voter = vote.from;
      commitTV.votes.accepted = commitTV.votes.accepted.filter(
        v => v !== voter,
      );
      commitTV.votes.rejected = commitTV.votes.rejected.filter(
        v => v !== voter,
      );

      // computa o voto
      if (vote.vote === 'accepted') {
        commitTV.votes.accepted.push(vote.from);
      }
      if (vote.vote === 'rejected') {
        commitTV.votes.rejected.push(vote.from);
      }

      // self.checkVotes(commitTV.commit.data.commitId);
    };

    self.checkVotes = function (commitId) {
      // checa se tem votos suficientes
      const commitTV = self.commitsInVoting[commitId];
      if (!commitTV) {
        return;
      }
      const acceptedCount = commitTV.votes.accepted.length;
      const rejectedCount = commitTV.votes.rejected.length;
      const accepted = acceptedCount >= this.majorityCount;
      const rejected = rejectedCount >= this.majorityCount;

      // se aceito
      if (
        accepted &&
        commitTV.commit.data.previousCommit === this.currentCommit
      ) {
        // dispara o alerta
        this.onAcceptCallback(commitTV);

        // deleta o aceito para não causar problemas pq outros commits
        // que referenciam ele ainda poder estar sendo votados
        delete self.commitsInVoting[commitTV.commit.data.commitId];

        // deleta todo mundo que passou a ser invalido
        self.removeCommitEntry(self.currentCommit);

        // atualiza o commit atual
        self.currentCommit = commitTV.commit.data.commitId;

        return right(commitTV);
      }

      // se rejeitado
      if (rejected) {
        // dispara o alerta
        this.OnRejectedallback(commitTV);

        // deleta o commit e todo mundo que passou depende dele
        self.removeCommitEntry(self.currentCommit);

        return left(commitTV);
      }
    };

    self.updateVoters = function (volters) {
      self.voters = volters;
    };
  } as CommitPoolFunction;
  return res;
})();
