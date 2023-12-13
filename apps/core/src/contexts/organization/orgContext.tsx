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
  org: Organization;
  stateValue: string;
  createOrg: () =>  void;
  deleteOrg: () =>  void;
  addMember: (ip: string) => void;
  joinOrg: () => void;
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
  const waitingForInvite = state?.matches('JoinAnOrganization.waitingForInvite') || false;
  const sendingOrgInfo = state?.matches('orgLoaded.sendingOrgInfo') || false;

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

  const addMember = (ip: string) => {
    send({ type: 'ADD_MEMBER', data: { ip } });
  }

  const joinOrg = () => {
    send({ type: 'JOIN_ORG' });
  }

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
    org: org?.creationDate ? org : placeholderOrg,
    stateValue,
    createOrg,
    addMember,
    joinOrg,
    deleteOrg,
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
