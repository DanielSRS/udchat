export interface GROUP_CREATION {
  type: 'GROUP_CREATION';
  data: {
    /** Id do commit */
    commitId: string;
    /** username do usuário que criou o grupo */
    createdBy: string;
    /** Data de criação */
    createdAt: string;
    /** commit inicial, sempre 'none' */
    previousCommit: 'none';
  };
}

type GroupCommits = GROUP_CREATION;

export interface Group {
  /** Identificador do grupo */
  id: string;
  /** Nome de exibição do grupo */
  name: string;
  /** data de criação do grupo. O valor é Epoch em base 36  */
  createdAt: string;
  /**
   * Membros do grupo
   *
   * Todos os membros do grupo são membros da organização.
   * a lista de membros do grupo é uma lista de IDs/usernames
   * dos membros da organização que estão no grupo
   */
  members: string[];
  /**
   * todos os eventos que acontecem no grupo
   */
  commits: [GroupCommits];
}
