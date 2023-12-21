import React from "react";
import { createContext } from "use-context-selector";
import { useGroupsMachine } from "./useGroupsMachine";
import { Group } from "./groupsTypes";
import { useUser } from "../../hooks";

interface GroupsContextProps {
  loadingGroups: boolean;
  failedToLoadFromStorage: boolean;
  loadedGroups: boolean;
  creatingGroup: boolean;
  groupNotCreated: boolean;
  storeCreatedGroup: boolean;
  storeCreatedGroupFailed: boolean;
  loadedGroupsIdle: boolean;
  // addingMembers: boolean;
  groups: Group[];
  createGroup: (groupName: string) => void;
  stateValue: string;
}

export const GroupsContext = createContext({} as GroupsContextProps);

const groupsContextData = () => {
  const user = useUser();
  const { send, state } = useGroupsMachine(user);

  const loadingGroups = state?.matches('LoadingGroups') || false;
  const failedToLoadFromStorage = state?.matches('FailedToLoadFromStorage') || false;
  const loadedGroups = state?.matches('LoadedGroups') || false;
  const creatingGroup = state?.matches('LoadedGroups.Groups.CreatingGroup') || false;
  const groupNotCreated = state?.matches('LoadedGroups.Groups.GroupNotCreated') || false;
  const storeCreatedGroup = state?.matches('LoadedGroups.Groups.StoreCreatedGroup') || false;
  const storeCreatedGroupFailed = state?.matches('LoadedGroups.Groups.StoreCreatedGroupFailed') || false;
  const loadedGroupsIdle = state?.matches('LoadedGroups.Groups.idle') || false;

  // const addingMembers = state?.matches('LoadedGroups.Groups.AddingMembers') || false;

  const groups = (() => {
    if (!state) return [];
    return Object.values(state.context.groups)
  })();

  const createGroup = (groupName: string) => {
    send({ type: 'CREATE_GROUP', data: { groupName } });
  };

  const stateValue = JSON.stringify(state?.value);

  return {
    loadingGroups,
    failedToLoadFromStorage,
    loadedGroups,
    creatingGroup,
    groupNotCreated,
    storeCreatedGroup,
    storeCreatedGroupFailed,
    loadedGroupsIdle,
    groups,
    createGroup,
    stateValue,
    // addingMembers,
  }
}

export const GroupsProvider = ({ children }: { children: React.ReactElement }) => {
  const data = groupsContextData();

  return (
    <GroupsContext.Provider value={data}>
      {children}
    </GroupsContext.Provider>
  );
}
