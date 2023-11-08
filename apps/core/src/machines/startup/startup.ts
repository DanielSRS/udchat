import { assign, createMachine } from "xstate";
// import { Organization } from "../../models/organization";
import { User } from "../../models/user/user";

type Events =
  | { type: 'CREATE_USER'; }
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'START_OVER'; };

type Services = { 
  getUser: { data: { user: User } };
  getOrg: { data: unknown };
  createUser: { data: { user: User } };
  saveUserToStorage: { data: unknown };
};

type Context = {
  user: User;
};

export const startupMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMBOKCuAHAsmgMYAWAlgHZgB0AZpRJVAKqxgYDEEA9ldZQDduAaxqpMOAsXJ96FRhRZsMCQdyJoUZXgG0ADAF19BxKFzdYZLb1MgAHogBMANgAc1RwFYA7Hsd6AFgBGIIBmH29nABoQAE9EUO9qAE49ZzdXT08g1wCAtwBfApjxLDxCUkoaOQUldg52DG4MalwAG01aZoBbalLJCplqhiZWdlUKIQ1rCmNjW3NLGdsHBABaR0dk6gDEv2c9MM9XPVcY+IQtoOofR1DXROSgvUPXbyKS9DKpStkRxQA8hgoFxeDQ1KI+l8BtIqnR-lAgVAJlNNNpZoZ5kgQIsrOiVohItsgp5QkEDsdUqFkp5zohnqEUs4vIdnN4yX5sh8QP1yrC-vImEiGhgmi12p0elCJHzfsNBYDgSj1GjdJjDAsLHibNjVgFku4SS8At5UuzXP5QnSEKFdtQcg8DqFQi9nEFktzeT8htQKNwxhgAGLcbDyDgAYQASgBRACCABVowB9ZgAZWjkaxZi1y11iA2tpuD1cyWSAT0lICx2tpMZuRJzkSPmyQXexR50NlPr9SODoYgEZjCeTAMjAHEszic-i8whUgEdqFHCWAg8TS5ktby4zqb5PGkl3cqZ7O964UQMGA0YoA6C+BCxKfBufL9e6io1NN0XMNdjcbnQFWNZkiSZIlyrbwTm8fIggCa0Tj0HZXDXVwQltVDnBPGUzz4C8ry0G9lBFMVWg6FAugwXovWfXDXwI99lS-NUjF-bMlhnQD83Ca4TSCRxyVNTJAnSeDyWobxNl8ED7ltRssO+GiaGwZRwzo9FAzQMg2mwS8OBjeNIwATUnf8OPsfNskcahG2ZPRfG8CSAmXa1vBJHYHP8N1nFLTx9XkmE5T6NABFGZR424VMUGaNAYDvcFJhER9sMUoKQsI9hwsi6KYEY1UMRYkw-2nHVOJtCTqBdNI-BLdkHLguJCW8TwKvLVIfG85xjiCfyuzhWBgtCjKIqijAYrAYjmlIyVKOlBT+TEAb0owTKRrG3KZh-Qq2O1CgCXWbyblOBynhOEJcm8a1nmSZwPFJEIK1krYepwha0qgDStJ08b9KMkzit22cNjCay3kOd1nVuRxLr0MtxN2c1QdNEDnpS-q3o+7TdNTeNY0jeMkwBAA1DM-vYkrzP2lwKuXPIfCeYJvOtLwkiO10DTZZlXCKds-QgOBbGo+bNTJgHSrWNkFyXXIIPp8lNwa9ZyXcVw3Eqh49jyAIUfm+EFXfYWdr23wKreFtMhCJ5QmiBX3QXMsm0SNkzTbT5kp1mohWBA2AIp+4bs8a7kk2alyU8RwLptoPxOZUkYe8kDXO1wK-QDPt5G9sygPCZqaRcGSmsSXZrXuRCWRybzIPZUkk59fpIAz8nViD64XGeO57lti1LoNFJlxdIk3FNK2a7hHtgTTiAG9FinB+sqv9hOTqg63PwblSU79jDx2R9o-DBowKe9rWF1motKt+OgyJIlpBXOsQktqQiRtQ9CHelJUtTeAxr7D8Bq3mq2GBYIPg3h8VJNaE61A0jlm8v4Z4ORPBv1SvvFa2UwC-zFuyHYng3S+Ukk5cO1sLiQOgWkIOhxXiIPbILQKaMmDf0vBgimGwrIqxVpzRw+pw52UujkBcvh0jpBcJ1LIWtuZAA */
  description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- O usuário (e suas chaves)
- A organização`,

  id: "startupMachine",

  tsTypes: {} as import("./startup.typegen").Typegen0,
  schema: {} as {
    events: Events;
    services: Services;
    context: Context;
  },

  states: {
    findingUser: {
      description: `Verifica se existe um usuário registrado`,

      invoke: {
        src: "getUser",
        onDone: {
          target: "findingOrg",
          description: `Se o usuário foi encontrado`,
          actions: "saveUserToContext"
        },
        onError: "noUserFound"
      }
    },

    findingOrg: {
      description: `Verifica se o usuário já participa de uma organização`,

      invoke: {
        src: "getOrg",

        onDone: {
          target: "started",
          description: `Organização encontrada`
        },

        onError: "noOrgFound"
      }
    },

    noUserFound: {
      on: {
        CREATE_USER: "creatingUser"
      },

      description: `Informações do usuário não foram encontradas no storage.

A unica opção para prosseguir é criando um novo usuário`
    },

    started: {},

    noOrgFound: {
      on: {
        CREATE_ORG: "started"
      }
    },

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
        onDone: "findingOrg",
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
