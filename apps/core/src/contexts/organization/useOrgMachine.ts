import { useState, useEffect } from 'react';
import { interpret, StateFrom } from "xstate";
import { orgMachine } from '../../machines';
import { createOrgService, getOrgService, saveOrgToStorageService } from './orgContextHelper';
import { Organization } from '../../models/organization';
import { useMessagesWith } from '../../hooks/useMessagesWith';
import { useUser } from '../../hooks';

type MachineState = Pick<StateFrom<typeof orgMachine>, 'matches' | 'context' | 'value'>;

export const useOrgMachine = () => {
  const user = useUser();
  const sendMessage = useMessagesWith({ commitId: 'joinOrg', callback: (msg) => { 
    console.log('joinOrg request: ', JSON.stringify(msg, null, 2));
   } });
  const [actor] = useState(interpret(orgMachine.withConfig({
    services: {
      createOrg: createOrgService,
      getOrg: getOrgService,
      saveOrgToStorage: saveOrgToStorageService,
      sendInvitation: (context, event) => {
        return new Promise((resolve, reject) => {
          const ip = event.data.ip;
          const header = {
            /** Versão o programa/protocolo */
            version: '0.0.1',
            /** Id do grupo de pacotes. todas as partes precisam ter o mesmo id */
            commitId: 'orphan:65165sd:joinOrg',
          }
          const body = {
            type: 'lsdkafj',
            data: {
              publicKey: context.user.encriptionKeys.publicKey,
            },
          }
          const message = `${JSON.stringify(header)}\r\n${JSON.stringify(body)}`;
          sendMessage({
            ip,
            message,
            port: 4322,
          })
          .then(res => {
            if (res.data.sucess) return resolve(res);
            console.log('sendInvitation res: ', JSON.stringify(res, null, 2));
            return reject(res);
          })
          
        });
      }
    }
  }).withContext({ organization: {} as Organization, orgInvitationCode: 0, user })));
  const [state, setState] = useState<MachineState>();

  useEffect(() => {
    actor.subscribe((s) => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('useOrgMachine unmount');
    }
  }, [actor]);

  useEffect(() => {
    actor.send({ type: 'SET_USER', data: { user } });
  }, [user]);

  return {
    state,
    send: actor.send,
  };
}
