import { Organization } from '../../models/organization';
import { ADD_MEMBER_TO_ORG_COMMIT } from '../../models/organization/organization';

export interface JOIN_ORG_INVITE {
  type: 'JOIN_ORG_INVITE';
  data: {
    invitingMember: {
      publicKey: string;
      name: string;
      username: string;
    };
    ip: string;
    port: number;
  };
}

export interface INVITE_ACEPTED_EVENT {
  type: 'INVITE_ACEPTED';
  data: {
    joiningMember: {
      publicKey: string;
      name: string;
      username: string;
    };
    code: number;
  };
}

export interface ACCEPT_INVITE {
  type: 'ACCEPT_INVITE';
  data: {
    code: number;
  };
}

export interface JOINED_ORG_INFO {
  type: 'JOINED_ORG_INFO';
}

export interface CANCELL_ORG_JOIN {
  type: 'CANCELL_ORG_JOIN';
}

export interface JOINED_ORG_INFO {
  type: 'JOINED_ORG_INFO';
  data: {
    org: Organization;
    addedMemberCommit: ADD_MEMBER_TO_ORG_COMMIT;
  };
}

export interface NEW_INGRESS_VOTE {
  type: 'NEW_INGRESS_VOTE';
  data: {
    /** username de quem votou */
    from: string;
    /** Um votante pode escolher aceitar ou rejeitar um commit */
    vote: 'accepted' | 'rejected';
    /** Commit para adicionar o voto */
    in: {
      commitId: string;
      previousCommit: string;
    };
  };
}

export interface INGRESS_REJECTED {
  type: 'INGRESS_REJECTED';
}

export interface APPROVED_INGRESS {
  type: 'APPROVED_INGRESS';
}
