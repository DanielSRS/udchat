import React from "react";
import { createContext } from "use-context-selector";
import { useUserMachine } from "./userUserMachine";
import { User } from "../../models/user/user";

interface UserContextProps {
  findingUser: boolean;
  noUserFound: boolean;
  creatingUser: boolean;
  userLoaded: boolean;
  savingFailure: boolean;
  user: User;
  createUser: () => void;
}

export const UserContext = createContext({} as UserContextProps);

const placeholderUser = {
  encriptionKeys: {
    privateKey: '',
    publicKey: '',
  },
  member: {
    name: '',
    username: '',
  },
};

const userContextData = (): UserContextProps => {
  const { send, state } = useUserMachine();

  const findingUser = state?.matches('findingUser') || false;
  const noUserFound = state?.matches('noUserFound') || false;
  const creatingUser = state?.matches('creatingUser') || false;
  const userLoaded = state?.matches('userLoaded') || false;
  const savingFailure = state?.matches('savingFailure') || false;

  const user = state?.context.user || placeholderUser

  const createUser = () => {
    send({ type: 'CREATE_USER' });
  }

  // console.log(JSON.stringify({
  //   findingUser,
  //   noUserFound,
  //   creatingUser,
  //   userLoaded,
  //   savingFailure,
  //   user: user?.encriptionKeys ? user : placeholderUser,
  //   createUser,
  // }, null, 2));

  return {
    findingUser,
    noUserFound,
    creatingUser,
    userLoaded,
    savingFailure,
    user: user?.encriptionKeys ? user : placeholderUser,
    createUser,
  }
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const data = userContextData();
  return (
    <UserContext.Provider value={data}>
      {children}
    </UserContext.Provider>
  );
}
