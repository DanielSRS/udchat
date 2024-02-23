export interface Commit<T extends string, K extends BaseCommitData> {
  type: T;
  data: K;
}

export interface BaseCommitData {
  commitId: string;
  previousCommit: string;
  from: string;
}

interface CommitFunction {
  new <T extends string, K extends BaseCommitData>(c: {
    type: T;
    data: K;
  }): Commit<T, K>;
  <T extends string, K extends BaseCommitData>(c: { type: T; data: K }): Commit<
    T,
    K
  >;
}

export const Commit = (() => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function Commit<J extends string, L extends BaseCommitData>(c: {
    type: J;
    data: L;
  }) {
    // Called as normal function (without new)
    if (!new.target) {
      const CommmitWithNew = Commit as CommitFunction;
      return new CommmitWithNew(c);
    }

    // Called as a constructor (with new)
    // @ts-ignore
    const self = this as Commit<J, L>;

    self.type = c.type;
    self.data = c.data;
  }

  return Commit as CommitFunction;
})();

// export { _Commit as Commit };
