import { assign, createMachine } from "xstate";
import { User } from "../../models/user/user";

type Events =
  | { type: 'CREATE_USER'; }
  | { type: 'RETRY'; }
  | { type: 'START_OVER'; };

type Services = { 
  getUser: { data: { user: User } };
  createUser: { data: { user: User } };
  saveUserToStorage: { data: unknown };
};

type Context = {
  user: User;
};

export const userMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFdZgE4FkCGBjAFgJYB2YAdAGYkQlQCqa6AxBAPalkkBurA1uagw4CJclWI1i9Rgm6tc2AC6F2AbQAMAXQ2bEoAA6tYhZez0gAHogBMANgAcZawFYA7OuvqALAEYfAZjdXWwAaEABPRH9XMgBOdVsHe2dnH3svLwcAXyywwSw8Ig5xSWkMJgx0VnQyfQAbJQpqgFsyfOEisWpaBgxZYh4FU2IdHXNDY2HzKwQAWmtrWLIvaI9bdQDne3V7MMiERZ8yN2t-e2jYn3UN+1ccvMYO0TJiVl70ADFWZAkmAGEAEoAUQAggAVIEAfToAGUgQCxkgQBMTCpiNNEPN-F5jud7LFYl51FtCVs9ohnP5-GR0j5nLZom5Uj47rkQO1Cs9cOgwEoeowWOxyHJ+G1HpyONzecopO9+oM+WotIiDEZUWYkTNZrEYrF-NYvG5tq5Mj4vOSENt1Mt7OcvPY-NiHbZ7uzxSJJTy+bKBZVqrUGoomuhWhyPeQpd6yuh5fJFSNlVpxmqpprMYEjl5XD5rD5bK5YslvIkLc6yK4Fu4dWdsQzXWHOmKMH8vcMPthCHVkDymMCwQCAJoq5EptEYuapaxkBm2TzuVwVrzWXYRRDZ5zLBeeWx5gnOLyxevuxuwbBcfkYMGsGGKarYGCCjgigTH56n88+y-X2-oe9gWNDGioxJkiKKpqAMzRFO-jXOsy7Vgu5qrggC4bti6jxG4tixLYWw+EeQgSuQ74XugV43neD5+jU9SNC0TYFOGZAkZ+ZHfpR-5yIBSraCBqqTGOaZzNhxw7AulzbH46SuBaVw4U4lJ+MStaLARjEnmetDtp23ZgL2QL9kOfEjgJGoQZiubUg47h+HqgQVtYskYTiJrRGctzqAWOpqU8HAsVA2ldj2MJgiCAJgpCADyABq8LDmBgnmXMhLUikKR2AkZxLo5yEGji-g5qklIMhJrjODkbKvBAcDmA2ojJqZ6JCdqlzHGlGUMukCwWrMZpLGc844Vc0S2EuPlEZQ3SsQ16pNUl7hkANzLJLZAShMhPiEnEKxlSNBaeayDyEUxrzvF8PwQDN4GWOmKRxM4dg1rtrkWmc1ouDc2GuLcgT+ONTH5AAMqw2DVZdoGjmZN0IGa2aLc48TfRcBoFhac6bqk+Ywd4B70v9jaRjK0ZXYl0OzDBG72AaD0slm+a4RauHWvi-ixEEDJ5pS+PPPkLbSmigW6STUNav4uFOAS2J0t92YuP4FoSWQCREthnhXGk5VsnVfmaax5E-n+wtzWTrjUoaO77pW2XBAraRK6NCSxGrNya0d6lvrrAUdkFYBG+O8xTvYDiJMuBpO-OslpC5CSJLOiRpV4FVZEAA */
  description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- O usuário (e suas chaves)`,

  id: "userMachine",

  tsTypes: {} as import("./userMachine.typegen").Typegen0,
  schema: {} as {
    events: Events;
    services: Services;
    context: Context;
  },

  states: {
    findingUser: {
      description: `Verifica se existe um usuário registrado `,

      invoke: {
        src: "getUser",
        onDone: {
          target: "userLoaded",
          description: `Se o usuário foi encontrado`,
          actions: "saveUserToContext"
        },
        onError: "noUserFound"
      }
    },

    noUserFound: {
      on: {
        CREATE_USER: "creatingUser"
      },

      description: `Informações do usuário não foram encontradas no storage.

A unica opção para prosseguir é criando um novo usuário`
    },

    userLoaded: {},

    creatingUser: {
      description: `Gera as chaves criptograficas e o membro`,

      invoke: {
        src: "createUser",
        onDone: {
          target: "savingUserToStorage",
          actions: "saveUserToContext"
        },
        onError: "userCreationFailure"
      }
    },

    userCreationFailure: {
      on: {
        RETRY: "creatingUser"
      }
    },

    savingUserToStorage: {
      invoke: {
        src: "saveUserToStorage",
        onDone: "userLoaded",
        onError: "savingFailure"
      }
    },

    savingFailure: {
      on: {
        RETRY: "savingUserToStorage",
        START_OVER: "findingUser"
      }
    }
  },

  initial: "findingUser",
  predictableActionArguments: true,
}, {
  actions: {
    saveUserToContext: assign((_, event) => event.data),
  }
});
