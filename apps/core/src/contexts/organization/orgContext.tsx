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
  org: Organization;
  createOrg: () =>  void;
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
  const orgLoaded = state?.matches('orgLoaded') || false;
  const creatingOrg = state?.matches('creatingOrganization') || state?.matches('savingOrgToStorage') || false;
  const savingOrgFailure = state?.matches('savingOrgFailure') || false;
  const orgCreationErr = state?.matches('orgCreationErr') || false;


  const org = state?.context.organization || placeholderOrg;

  const createOrg = () => {
    send({ type: 'CREATE_ORG' });
  }

  return {
    findingOrg,
    noOrgFound,
    orgLoaded,
    creatingOrg,
    savingOrgFailure,
    orgCreationErr,
    org: org?.creationDate ? org : placeholderOrg,
    createOrg,
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
