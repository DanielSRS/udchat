import { useState, useEffect } from 'react';
import { interpret, StateFrom } from "xstate";
import { groupsMachine } from '../../machines/groups/groupsMachine';
import { createGroup, getGroups, saveGroups } from '../../managers/group/groupManager';
import { Group } from './groupsTypes';
import { User } from '../../models/user/user';

type MachineState = Pick<StateFrom<typeof groupsMachine>, 'matches' | 'context' | 'value'>;

export const useGroupsMachine = (user: User) => {
  const [actor] = useState(interpret(groupsMachine.withConfig({
    services: {
      createGroup: (_, event) => {
        return new Promise<{ createdGroup: Group }>((resolve, reject) => {
          if (user.encriptionKeys.publicKey.length < 5) {
            // console.log(`useGroupsMachine: createGroup: ${JSON.stringify(user, null, 2)}`);
            return reject({
              type: 'GROUP_CREATION_SERVICE_ERROR',
              data: {
                message: 'invalid user',
              },
            });
          }
          const newGroup = createGroup({
            groupName: event.data.groupName,
            creatorMmemberInfo: user.member,
          });
          resolve({ createdGroup: newGroup });
        });
      },
      loadGroupsFromStorage: () => new Promise(async (resolve, reject) => {
        const groups = await getGroups({});
        if (groups._tag === 'Left') {
          // console.log('fallllli', JSON.stringify(groups.left));
          return reject(groups.left);
        };
        return resolve(groups.right);
      }),
      storeGroupToStorage: (context) => new Promise<unknown>(async (resolve, reject) => {
        const res = await saveGroups({
          groups: context.groups,
          groupsIds: context.groupsIndex,
        });
        if (res._tag === 'Left') return reject(res.left);
        resolve(res.right);
      }),
    },
  }).withContext({
    groups: {} as { [key: string]: Group },
    groupsIndex: [],
  })));
  const [state, setState] = useState<MachineState>();

  useEffect(() => {
    actor.subscribe((s) => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('useGroupsMachine unmount');
    }
  }, [actor]);


  return {
    state,
    send: actor.send,
  };
}

