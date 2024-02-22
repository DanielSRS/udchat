import React from 'react';
import { createContext } from 'use-context-selector';
import { Organization } from '../../models/organization';
import { useOrgMachine } from './useOrgMachine';

interface OrgContextProps {
  findingOrg: boolean;
  noOrgFound: boolean;
  orgLoaded: boolean;
  creatingOrg: boolean;
  savingOrgFailure: boolean;
  orgCreationErr: boolean;
  sendingInvitation: boolean;
  invitationNotSent: boolean;
  waitingResponse: boolean;
  sendingOrgInfo: boolean;
  waitingForInvite: boolean;
  ReceivedInviteToJoinOrg: boolean;
  addingNewMember: boolean;
  waitingOrgData: boolean;
  orgInfoNotSent: boolean;
  org: Organization;
  stateValue: string;
  createOrg: () => void;
  deleteOrg: () => void;
  addMember: (ip: string) => void;
  acceptInvite: (code: number) => void;
  joinOrg: () => void;
  newMember: () => void;
  cancellOrgJoin: () => void;
  invitingMember:
    | {
        publicKey: string;
        name: string;
        username: string;
      }
    | undefined;
  invitationCode: number;
  transitions: string[];
}

export const OrgContext = createContext({} as OrgContextProps);

const placeholderOrg: Organization = {
  firstCommit: 'laskdjf',
  commits: [
    {
      type: 'orgCreation',
      data: {
        createdAt: 'lskdfj',
        createdBy: {
          name: 'lskajd',
          username: 'kasldfj',
          ip: 'lksdfj',
          publicKey: 'dkfçj',
        },
        commitId: 'aksldjf',
        previousCommit: 'none',
      },
    },
  ],
  creationDate: 'dalkja',
  members: [
    {
      name: 'rklas',
      username: 'lksdjf',
      ip: 'lksdfj',
      publicKey: 'dkfçj',
    },
  ],
};

const useOrgContextData = (): OrgContextProps => {
  const { send, state, transitions } = useOrgMachine();

  const findingOrg = state?.matches('orgOnTheStorage.findingOrg') || false;
  const noOrgFound = state?.matches('orgOnTheStorage.noOrgFound') || false;
  const orgLoaded = state?.matches('orgLoaded.Members.idle') || false;
  const creatingOrg =
    state?.matches('orgOnTheStorage.creatingOrganization') ||
    state?.matches('orgOnTheStorage.savingOrgToStorage') ||
    false;
  const savingOrgFailure =
    state?.matches('orgOnTheStorage.savingOrgFailure') || false;
  const orgCreationErr =
    state?.matches('orgOnTheStorage.orgCreationErr') || false;

  const sendingInvitation =
    state?.matches('orgLoaded.Members.sendingInvitation') || false;
  const invitationNotSent =
    state?.matches('orgLoaded.Members.invitationNotSent') || false;
  const waitingResponse =
    state?.matches('orgLoaded.Members.waitingResponse') || false;
  const sendingOrgInfo =
    state?.matches('orgLoaded.Members.sendingOrgInfo') || false;
  const addingNewMember =
    state?.matches('orgLoaded.Members.addingNewMember') || false;
  const orgInfoNotSent =
    state?.matches('orgLoaded.Members.orgInfoNotSent') || false;

  const waitingForInvite =
    state?.matches('JoinAnOganization.waitingForInvite') || false;
  const ReceivedInviteToJoinOrg =
    state?.matches('JoinAnOganization.ReceivedInviteToJoinOrg') || false;
  const waitingOrgData =
    state?.matches('JoinAnOganization.WaitingOrgData') || false;

  const invitationCode = state?.context.orgInvitationCode || -1;

  const stateValue = (() => {
    if (!state) {
      return 'undefined';
    }

    const value = state.value;

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return 'unknown';
  })();

  const org = state?.context.organization || placeholderOrg;

  const createOrg = () => {
    send({ type: 'CREATE_ORG' });
  };

  const deleteOrg = () => {
    send({ type: 'DELETE_ORG' });
  };

  const newMember = () => {
    send({ type: 'NEW_MEMBER' });
  };

  const addMember = (ip: string) => {
    send({ type: 'ADD_MEMBER', data: { ip } });
  };

  /** Aceita o convite enviado por outro usuário para entrar numa organização */
  const acceptInvite = (code: number) => {
    send({ type: 'ACCEPT_INVITE', data: { code } });
  };

  const joinOrg = () => {
    send({ type: 'JOIN_ORG' });
  };

  const cancellOrgJoin = () => {
    send({ type: 'CANCELL_ORG_JOIN' });
  };

  const invitingMember = state?.context.invitingMember;

  return {
    findingOrg,
    noOrgFound,
    orgLoaded,
    creatingOrg,
    savingOrgFailure,
    orgCreationErr,
    invitationNotSent,
    sendingInvitation,
    waitingResponse,
    sendingOrgInfo,
    waitingForInvite,
    addingNewMember,
    ReceivedInviteToJoinOrg,
    waitingOrgData,
    orgInfoNotSent,
    org: org?.creationDate ? org : placeholderOrg,
    stateValue,
    createOrg,
    addMember,
    joinOrg,
    deleteOrg,
    cancellOrgJoin,
    newMember,
    acceptInvite,
    invitingMember,
    invitationCode,
    transitions,
  };
};

export const OrgProvider = ({ children }: { children: React.ReactNode }) => {
  const data = useOrgContextData();
  return <OrgContext.Provider value={data}>{children}</OrgContext.Provider>;
};
