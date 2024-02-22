import { useState, useEffect } from 'react';
import { interpret, StateFrom } from 'xstate';
import { userMachine } from '../../machines';
import { User } from '../../models/user/user';
import {
  createUserService,
  getUserService,
  saveUserToStorageService,
} from './userContextHelper';

type MachineState = Pick<StateFrom<typeof userMachine>, 'matches' | 'context'>;

export const useUserMachine = () => {
  const [actor] = useState(
    interpret(
      userMachine
        .withConfig({
          services: {
            getUser: getUserService,
            createUser: createUserService,
            saveUserToStorage: saveUserToStorageService,
          },
        })
        .withContext({ user: {} as User }),
    ),
  );
  const [state, setState] = useState<MachineState>();

  useEffect(() => {
    actor.subscribe(s => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('useUSerMachine unmount');
    };
  }, [actor]);

  return {
    state,
    send: actor.send,
  };
};
