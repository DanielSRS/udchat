import React from "react";
import { createContext } from "use-context-selector";
import { useOrgMachine } from "./useOrgMachine";
import { Organization } from "../../models/organization";

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
  createOrg: () =>  void;
  deleteOrg: () =>  void;
  addMember: (ip: string) => void;
  acceptInvite: (code: number) => void;
  joinOrg: () => void;
  newMember: () => void;
  cancellOrgJoin: () => void;
  invitingMember: {
    publicKey: string;
    name: string;
    username: string;
  } | undefined,
  invitationCode: number;
}

export const OrgContext = createContext({} as OrgContextProps);

const placeholderOrg: Organization = {
  commits: [{
    createdAt: 'lskdfj',
    createdBy: {
      name: 'lskajd',
      username: 'kasldfj',
    },
    previousCommit: 'none',
    type: 'orgCreation',
  }],
  creationDate: 'dalkja',
  members: [{
    name: 'rklas',
    username: 'lksdjf'
  }],
};

const orgContextData = (): OrgContextProps => {
  const { send, state } = useOrgMachine();

  const findingOrg = state?.matches('findingOrg') || false;
  const noOrgFound = state?.matches('noOrgFound') || false;
  const orgLoaded = state?.matches('orgLoaded.idle') || false;
  const creatingOrg = state?.matches('creatingOrganization') || state?.matches('savingOrgToStorage') || false;
  const savingOrgFailure = state?.matches('savingOrgFailure') || false;
  const orgCreationErr = state?.matches('orgCreationErr') || false;

  const sendingInvitation = state?.matches('orgLoaded.sendingInvitation')|| false;
  const invitationNotSent = state?.matches('orgLoaded.invitationNotSent') || false;
  const waitingResponse = state?.matches('orgLoaded.waitingResponse') || false;
  const sendingOrgInfo = state?.matches('orgLoaded.sendingOrgInfo') || false;
  const addingNewMember = state?.matches('orgLoaded.addingNewMember') || false;
  const orgInfoNotSent = state?.matches('orgLoaded.orgInfoNotSent') || false;

  const waitingForInvite = state?.matches('JoinAnOrganization.waitingForInvite') || false;
  const ReceivedInviteToJoinOrg = state?.matches('JoinAnOrganization.ReceivedInviteToJoinOrg') || false;
  const waitingOrgData = state?.matches('JoinAnOrganization.WaitingOrgData') || false;

  const invitationCode = state?.context.orgInvitationCode || -1;

  const stateValue = (() => {
    if (!state) return 'undefined';

    const value = state.value;

    if (typeof value === 'string') return value;

    if (typeof value === 'object') return JSON.stringify(value);

    return 'unknown';
  })();

  const org = state?.context.organization || placeholderOrg;

  const createOrg = () => {
    send({ type: 'CREATE_ORG' });
  }

  const deleteOrg = () => {
    send({ type: 'DELETE_ORG' });
  }

  const newMember = () => {
    send({ type: 'NEW_MEMBER' });
  }

  const addMember = (ip: string) => {
    send({ type: 'ADD_MEMBER', data: { ip } });
  }

  /** Aceita o convite enviado por outro usuário para entrar numa organização */
  const acceptInvite = (code: number) => {
    send({ type: 'ACCEPT_INVITE', data: { code } });
  }

  const joinOrg = () => {
    send({ type: 'JOIN_ORG' });
  }

  const cancellOrgJoin = () => {
    send({ type: 'CANCELL_ORG_JOIN' });
  }

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
  }
}

export const OrgProvider = ({ children }: { children: React.ReactNode }) => {
  const data = orgContextData();
  return (
    <OrgContext.Provider value={data}>
      {children}
    </OrgContext.Provider>
  );
}
