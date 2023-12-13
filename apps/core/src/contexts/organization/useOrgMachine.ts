import { useState, useEffect } from 'react';
import { interpret, StateFrom } from "xstate";
import { orgMachine } from '../../machines';
import { createOrgService, getOrgService, saveOrgToStorageService } from './orgContextHelper';
import { Organization } from '../../models/organization';
import { useMessagesWith } from '../../hooks/useMessagesWith';
import { useUser } from '../../hooks';
import { INVITE_ACEPTED_EVENT, JOIN_ORG_INVITE } from './orgEventTypes';

type MachineState = Pick<StateFrom<typeof orgMachine>, 'matches' | 'context' | 'value'>;

export const useOrgMachine = () => {
  const user = useUser();
  const sendMessage = useMessagesWith({ commitId: 'JOIN_ORG_INVITE', callback: (msg) => { 
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
            commitId: 'orphan:65165sd:JOIN_ORG_INVITE',
          }
          const body: JOIN_ORG_INVITE = {
            type: 'JOIN_ORG_INVITE',
            data: {
              invitingMember: {
                publicKey: context.user.encriptionKeys.publicKey,
                name: context.user.member.name,
                username: context.user.member.username,
                ip: ' ',
                // port: ' ',
              },
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
      },
      sendInviteAcceptance: (context, event) => {
        return new Promise((resolve, reject) => {
          const ip = context.invitingMember.ip;
          const port = 4322;
          const code = event.data.code;
          const header = {
            /** Versão o programa/protocolo */
            version: '0.0.1',
            /** Id do grupo de pacotes. todas as partes precisam ter o mesmo id */
            commitId: 'orphan:65165sd:ACCEPT_INVITE',
          };
          const body: INVITE_ACEPTED_EVENT = {
            type: 'INVITE_ACEPTED',
            data: {
              joiningMember: {
                name: context.user.member.name,
                username: context.user.member.username,
                publicKey: context.user.encriptionKeys.publicKey,
              },
            },
          };
          const message = `${JSON.stringify(header)}\r\n${JSON.stringify(body)}`;
          sendMessage({
            ip,
            message,
            port,
          })
            .then(res => {
              if (res.data.sucess) return resolve(res);
              console.log('sendInviteAcceptance res: ', JSON.stringify(res, null, 2));
              return reject(res);
            });
        });
      },
    }
  }).withContext({
    organization: {} as Organization,
    orgInvitationCode: 0,
    user,
    invitingMember: {} as JOIN_ORG_INVITE['data']['invitingMember']
  })));
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
