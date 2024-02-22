import { useState, useEffect } from 'react';
import { interpret, StateFrom } from 'xstate';
import { startupMachine } from '../../machines';
import {
  createOrgService,
  createUserService,
  getOrgService,
  getUserService,
  saveOrgToStorageService,
  saveUserToStorageService,
} from '../startup/startupHelper';
import { User } from '../../models/user/user';
import { Organization } from '../../models/organization';

type MachineState = Pick<
  StateFrom<typeof startupMachine>,
  'matches' | 'context'
>;

export const useStatupMachine = () => {
  const [actor] = useState(
    interpret(
      startupMachine
        .withConfig({
          services: {
            getUser: getUserService,
            getOrg: getOrgService,
            createUser: createUserService,
            saveUserToStorage: saveUserToStorageService,
            createOrg: createOrgService,
            saveOrgToStorage: saveOrgToStorageService,
          },
        })
        .withContext({ user: {} as User, organization: {} as Organization }),
    ),
  );
  const [state, setState] = useState<MachineState>();

  useEffect(() => {
    actor.subscribe(s => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('unsubbbb');
    };
  }, [actor]);

  return {
    state,
    send: actor.send,
  };
};
