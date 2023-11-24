import { describe, expect, it, mock } from "bun:test";
import { interpret } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { startupMachine } from "./startup";
import { User } from "../../models/user/user";

describe('Startup machine transita entre os estados como esperado', () => {
  it('Inicia no estado esperado', async () => {
    const startupActor = interpret(startupMachine.withConfig({
      services: {
        getUser: () => new Promise((_, reject) => reject()),
        createOrg: () => new Promise((_, reject) => reject()),
        createUser: () => new Promise((_, reject) => reject()),
        getOrg: () => new Promise((_, reject) => reject()),
        saveOrgToStorage: () => new Promise((_, reject) => reject()),
        saveUserToStorage: () => new Promise((_, reject) => reject()),
      }
    }));
    const initialState = startupActor.start().getSnapshot();
    expect(initialState.value).toBe('findingUser');
  });

  it('Busca usuário assim que a maquina inicializa', async () => {
    const getUser = mock(() => new Promise((_, reject) => {
      reject();
    })) as () => Promise<{ user: User }>;
  
    const startupActor = interpret(startupMachine.withConfig({
      services: {
        getUser,
        createOrg: () => new Promise((_, reject) => reject()),
        createUser: () => new Promise((_, reject) => reject()),
        getOrg: () => new Promise((_, reject) => reject()),
        saveOrgToStorage: () => new Promise((_, reject) => reject()),
        saveUserToStorage: () => new Promise((_, reject) => reject()),
      }
    }));
    startupActor.start();
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it('Transita para o estado noUserFound se não foi possível encontrar o usuáario', async () => {
    const startupActor = interpret(startupMachine.withConfig({
      services: {
        getUser: () => new Promise((_, reject) => reject()),
        createOrg: () => new Promise((_, reject) => reject()),
        createUser: () => new Promise((_, reject) => reject()),
        getOrg: () => new Promise((_, reject) => reject()),
        saveOrgToStorage: () => new Promise((_, reject) => reject()),
        saveUserToStorage: () => new Promise((_, reject) => reject()),
      }
    }));
    startupActor.start();
    const newState = await waitFor(startupActor, state =>
      state.matches('noUserFound')
    );
    expect(newState.value).toBe('noUserFound');
  });

  it('Transita para o estado findingOrg se o usuáario foi encontrado', async () => {
    const startupActor = interpret(startupMachine.withConfig({
      services: {
        getUser: () => new Promise((resolve) => resolve({} as { user: User })),
        createOrg: () => new Promise((_, reject) => reject()),
        createUser: () => new Promise((_, reject) => reject()),
        getOrg: () => new Promise((_, reject) => reject()),
        saveOrgToStorage: () => new Promise((_, reject) => reject()),
        saveUserToStorage: () => new Promise((_, reject) => reject()),
      }
    }));
    startupActor.start();
    const newState = await waitFor(startupActor, state =>
      state.matches('findingOrg')
    );
    expect(newState.value).toBe('findingOrg');
  });

  it('Transita para o estado creatingUser se em noUserFound e um novo usuário é criado', async () => {
    const startupActor = interpret(startupMachine.withConfig({
      services: {
        getUser: () => new Promise((_, reject) => reject()),
        createOrg: () => new Promise((_, reject) => reject()),
        createUser: () => new Promise(() => {}),
        getOrg: () => new Promise((_, reject) => reject()),
        saveOrgToStorage: () => new Promise((_, reject) => reject()),
        saveUserToStorage: () => new Promise((_, reject) => reject()),
      }
    }));
    startupActor.start();
    await waitFor(startupActor, state =>
      state.matches('noUserFound')
    );
    startupActor.send({ type: 'CREATE_USER' });
    const newState = await waitFor(startupActor, state =>
      state.matches('creatingUser')
    );
    expect(newState.value).toBe('creatingUser');
  });
});
