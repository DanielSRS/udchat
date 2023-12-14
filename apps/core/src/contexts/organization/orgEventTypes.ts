export interface JOIN_ORG_INVITE {
  type: 'JOIN_ORG_INVITE';
  data: {
    invitingMember: {
      publicKey: string;
      name: string;
      username: string;
      ip: string;
      // port: string;
    };
  };
};

export interface INVITE_ACEPTED_EVENT {
  type: 'INVITE_ACEPTED';
  data: {
    joiningMember: {
      publicKey: string;
      name: string;
      username: string;
    };
  };
};

export interface ACCEPT_INVITE {
  type: 'ACCEPT_INVITE';
  data: {
    code: number;
  };
};

export interface JOINED_ORG_INFO {
  type: 'JOINED_ORG_INFO';
}

export interface CANCELL_ORG_JOIN {
  type: 'CANCELL_ORG_JOIN';
}

