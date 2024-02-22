export interface Commit<T extends string, K extends object> {
  type: T;
  data: K;
}

interface CommitFunction {
  new <T extends string, K extends object>(type: T, data: K): Commit<T, K>;
  <T extends string, K extends object>(type: T, data: K): Commit<T, K>;
}

export const Commit = (() => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function Commit<J extends string, L extends object>(
    commitType: J,
    commitData: L,
  ) {
    // Called as normal function (without new)
    if (!new.target) {
      const CommmitWithNew = Commit as CommitFunction;
      return new CommmitWithNew(commitType, commitData);
    }

    // Called as a constructor (with new)
    // @ts-ignore
    const self = this as Commit<J, L>;

    self.type = commitType;
    self.data = commitData;
  }

  return Commit as CommitFunction;
})();

// export { _Commit as Commit };
