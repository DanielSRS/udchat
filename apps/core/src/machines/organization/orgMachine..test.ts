import { describe, expect, it, jest } from '@jest/globals';
import { interpret } from 'xstate';
import { orgMachine } from '..';
import { waitFor } from 'xstate/lib/waitFor';

describe('Org machine transita entre os estados como esperado', () => {
  it('Inicia no estado esperado', async () => {
    const startupActor = interpret(
      orgMachine
        .withConfig({
          services: {
            createOrg: () => new Promise((_, reject) => reject()),
            deleteOrg: () => new Promise((_, reject) => reject()),
            getOrg: () => new Promise((_, reject) => reject()),
            saveOrgToStorage: () => new Promise((_, reject) => reject()),
            sendInvitation: () => new Promise((_, reject) => reject()),
            sendInviteAcceptance: () => new Promise((_, reject) => reject()),
            sendOrg: () => new Promise((_, reject) => reject()),
          },
        })
        .withContext({} as any),
    );
    const initialState = startupActor.start().getSnapshot();
    const state = JSON.stringify(initialState.value);
    expect(state).toBe('{"orgOnTheStorage":"findingOrg"}');
  });

  it('Busca organization assim que a maquina inicializa', async () => {
    const getOrg = jest.fn(
      () =>
        new Promise((_, reject) => {
          reject();
        }),
    ) as any;

    const startupActor = interpret(
      orgMachine
        .withConfig({
          services: {
            createOrg: () => new Promise((_, reject) => reject()),
            deleteOrg: () => new Promise((_, reject) => reject()),
            getOrg,
            saveOrgToStorage: () => new Promise((_, reject) => reject()),
            sendInvitation: () => new Promise((_, reject) => reject()),
            sendInviteAcceptance: () => new Promise((_, reject) => reject()),
            sendOrg: () => new Promise((_, reject) => reject()),
          },
        })
        .withContext({} as any),
    );
    startupActor.start();
    expect(getOrg).toHaveBeenCalledTimes(1);
  });

  it('Transita para o estado noOrgFound se não foi possível encontrar a organização', async () => {
    const startupActor = interpret(
      orgMachine
        .withConfig({
          services: {
            createOrg: () => new Promise((_, reject) => reject()),
            deleteOrg: () => new Promise((_, reject) => reject()),
            getOrg: () => new Promise((_, reject) => reject()),
            saveOrgToStorage: () => new Promise((_, reject) => reject()),
            sendInvitation: () => new Promise((_, reject) => reject()),
            sendInviteAcceptance: () => new Promise((_, reject) => reject()),
            sendOrg: () => new Promise((_, reject) => reject()),
          },
        })
        .withContext({} as any),
    );
    startupActor.start();
    const newState = await waitFor(startupActor, state =>
      state.matches('orgOnTheStorage.noOrgFound'),
    );
    const state = JSON.stringify(newState.value);
    expect(state).toBe('{"orgOnTheStorage":"noOrgFound"}');
  });
});

describe('Entrando numa organização', () => {
  it('Aguarda um convitewaitingForInvite', async () => {
    const startupActor = interpret(
      orgMachine
        .withConfig({
          services: {
            createOrg: () => new Promise((_, reject) => reject()),
            deleteOrg: () => new Promise((_, reject) => reject()),
            getOrg: () => new Promise((_, reject) => reject()),
            saveOrgToStorage: () => new Promise((_, reject) => reject()),
            sendInvitation: () => new Promise((_, reject) => reject()),
            sendInviteAcceptance: () => new Promise((_, reject) => reject()),
            sendOrg: () => new Promise((_, reject) => reject()),
          },
        })
        .withContext({
          ingressOrgStatus: false,
          invitingMember: {} as any,
          ip: '0',
          newOrgPool: {} as any,
          organization: {} as any,
          orgInvitationCode: 165,
          user: {
            encriptionKeys: {} as any,
            member: {
              ip: '',
              name: '',
              publicKey: '',
              username: '',
            },
          },
        }),
    );
    startupActor.start();
    await waitFor(startupActor, state =>
      state.matches('orgOnTheStorage.noOrgFound'),
    );
    startupActor.send({ type: 'JOIN_ORG' });
    const newState = await waitFor(startupActor, state =>
      state.matches('JoinAnOganization.waitingForInvite'),
    );
    // startupActor.send({
    //   type: 'JOIN_ORG_INVITE',
    //   data: {
    //     ip: 'ip',
    //     invitingMember: {
    //       name: 'name',
    //       publicKey: 'publicKey',
    //       username: 'username',
    //     },
    //     port: 123,
    //   },
    // });
    // await waitFor(startupActor, state =>
    //   state.matches('JoinAnOganization.ReceivedInviteToJoinOrg'),
    // );
    // startupActor.send({
    //   type: 'ACCEPT_INVITE',
    //   data: {
    //     code: 321,
    //   },
    // });
    // const newState = await waitFor(startupActor, state =>
    //   state.matches('JoinAnOganization.SendingAceptance'),
    // );
    const state = JSON.stringify(newState.value);
    expect(state).toBe('{"JoinAnOganization":"waitingForInvite"}');
  });
});
