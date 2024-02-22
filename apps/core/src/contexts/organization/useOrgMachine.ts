import { useState, useEffect } from 'react';
import { interpret, StateFrom } from 'xstate';
import { orgMachine } from '../../machines';
import {
  createOrgService,
  deleteOrgFromStorageService,
  getOrgService,
  saveOrgToStorageService,
} from './orgContextHelper';
import { Organization } from '../../models/organization';
import { useMessagesWith } from '../../hooks/useMessagesWith';
import { useUser } from '../../hooks';
import {
  INVITE_ACEPTED_EVENT,
  JOIN_ORG_INVITE,
  JOINED_ORG_INFO,
} from './orgEventTypes';
import { useContextSelector } from 'use-context-selector';
import { NetworkContext } from '../network/networkContext';

type MachineState = Pick<
  StateFrom<typeof orgMachine>,
  'matches' | 'context' | 'value'
>;

export const useOrgMachine = () => {
  const user = useUser();
  const sendMessage = useContextSelector(
    NetworkContext,
    data => data.sendMessage,
  );
  const updateETCPcredentials = useContextSelector(
    NetworkContext,
    data => data.updateETCPcredentials,
  );
  const [actor] = useState(
    interpret(
      orgMachine
        .withConfig({
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
                };
                const body: JOIN_ORG_INVITE = {
                  type: 'JOIN_ORG_INVITE',
                  data: {
                    invitingMember: {
                      publicKey: context.user.encriptionKeys.publicKey,
                      name: context.user.member.name,
                      username: context.user.member.username,
                      // port: ' ',
                    },
                    ip: '',
                    port: 0,
                  },
                };
                const message = `${JSON.stringify(header)}\r\n${JSON.stringify(
                  body,
                )}`;
                sendMessage({
                  ip,
                  message,
                  port: 4322,
                }).then(res => {
                  if (res.data.sucess) {
                    return resolve(res);
                  }
                  console.log(
                    'sendInvitation res: ',
                    JSON.stringify(res, null, 2),
                  );
                  return reject(res);
                });
              });
            },
            sendInviteAcceptance: (context, event) => {
              return new Promise((resolve, reject) => {
                const ip = context.ip;
                const port = 4322;
                const code = event.data.code;
                const header = {
                  /** Versão o programa/protocolo */
                  version: '0.0.1',
                  /** Id do grupo de pacotes. todas as partes precisam ter o mesmo id */
                  commitId: 'orphan:65165sd:INVITE_ACEPTED',
                };
                const body: INVITE_ACEPTED_EVENT = {
                  type: 'INVITE_ACEPTED',
                  data: {
                    joiningMember: {
                      name: context.user.member.name,
                      username: context.user.member.username,
                      publicKey: context.user.encriptionKeys.publicKey,
                    },
                    code,
                  },
                };
                const message = `${JSON.stringify(header)}\r\n${JSON.stringify(
                  body,
                )}`;
                sendMessage({
                  ip,
                  message,
                  port,
                }).then(res => {
                  if (res.data.sucess) {
                    return resolve(res);
                  }
                  console.log(
                    'sendInviteAcceptance res: ',
                    JSON.stringify(res, null, 2),
                  );
                  return reject(res);
                });
              });
            },
            deleteOrg: deleteOrgFromStorageService,
            sendOrg: (context, event) => {
              return new Promise((resolve, reject) => {
                const org = context.organization;
                // @ts-expect-error
                const newMemberIp = event.data.ip;
                const newMember = {
                  ip: newMemberIp,
                  name: event.data.joiningMember.name,
                  publicKey: event.data.joiningMember.publicKey,
                  username: event.data.joiningMember.username,
                };
                org.commits.push({
                  type: 'ADD_MEMBER_TO_ORG_COMMIT',
                  data: {
                    commitId: generateCommitId(),
                    createdAt: new Date().getTime().toString(36),
                    newMember,
                    previousCommit:
                      org.commits[org.commits.length - 1]?.data.commitId || '',
                  },
                });
                org.members.push(newMember);
                const header = {
                  /** Versão o programa/protocolo */
                  version: '0.0.1',
                  /** Id do grupo de pacotes. todas as partes precisam ter o mesmo id */
                  commitId: 'orphan:kjh34kjh:JOINED_ORG_INFO',
                };
                const body: JOINED_ORG_INFO = {
                  type: 'JOINED_ORG_INFO',
                  data: {
                    org,
                  },
                };
                const message = `${JSON.stringify(header)}\r\n${JSON.stringify(
                  body,
                )}`;
                sendMessage({
                  ip: newMemberIp,
                  message,
                  port: 4322,
                }).then(res => {
                  if (res.data.sucess) {
                    return resolve({
                      type: 'sendOrg',
                      data: {
                        net: res,
                        commit: body,
                      },
                    });
                  }
                  console.log('sendOrg res: ', JSON.stringify(res, null, 2));
                  return reject(res);
                });
              });
            },
          },
        })
        .withContext({
          organization: {} as Organization,
          orgInvitationCode: 0,
          user,
          invitingMember: {} as JOIN_ORG_INVITE['data']['invitingMember'],
          ip: '',
        }),
    ),
  );
  const [state, setState] = useState<MachineState>();
  const transitions = actor.machine.transitions.map(t => t.eventType);

  useMessagesWith({
    commitId: ['JOIN_ORG_INVITE', 'INVITE_ACEPTED', 'JOINED_ORG_INFO'],
    callback: msg => actor.send(msg as any),
  });

  useEffect(() => {
    actor.subscribe(s => {
      setState(s as MachineState);
    });
    actor.start();

    return () => {
      console.log('useOrgMachine unmount');
    };
  }, [actor]);

  useEffect(() => {
    actor.send({ type: 'SET_USER', data: { user } });
    if (user.encriptionKeys.publicKey.length > 5) {
      // console.log(`update user: `, JSON.stringify(user.encriptionKeys, null, 2));
      updateETCPcredentials({
        ...user.encriptionKeys,
        username: user.member.username,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    state,
    send: actor.send,
    transitions,
  };
};

const generateCommitId = () => {
  const commitId = `${new Date().getTime().toString(36)}${generateRandomInteger(
    1234506789,
    9876054321,
  ).toString(36)}${new Date().getTime().toString(36)}`;
  return commitId;
};

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
