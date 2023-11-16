import { assign, createMachine } from "xstate";
// import { Organization } from "../../models/organization";
import { User } from "../../models/user/user";
import { Organization } from "../../models/organization";

type Events =
  | { type: 'CREATE_USER'; }
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'START_OVER'; };

type Services = { 
  getUser: { data: { user: User } };
  getOrg: { data: { organization: Organization } };
  createUser: { data: { user: User } };
  saveUserToStorage: { data: unknown };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
};

type Context = {
  user: User;
  organization: Organization,
};

export const startupMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMBOKCuAHAsmgMYAWAlgHZgB0AZpRJVAKqxgYDEEA9ldZQDduAaxqpMOAsXJ96FRhRZsMCQdyJoUZXgG0ADAF19BxKFzdYZLb1MgAHogBMANgAc1RwFYA7Hsd6AFgBGIIBmH29nABoQAE9EUO9qAE49ZzdXT08g1wCAtwBfApjxLDxCUkoaOQUldg52DG4MalwAG01aZoBbalLJCplqhiZWdlUKIQ1rCmNjW3NLGdsHBABaR0dk6gDEv2c9MM9XPVcY+IQtoOofR1DXROSgvUPXbyKS9DKpStkRxQA8hgoFxeDQ1KI+l8BtIqnR-lAgVAJlNNNpZoZ5kgQIsrOiVohng9qC9nN4Aodkt5vKFQudEAcbi88mFnPdQi5kh8QP1yrC-vImEiGhgmi12p0elCJHzfsNBYDgSj1GjdJjDAsLHibNjVgFku4gp5md5UjTXP46XEErtqDkHgdaaSglzijzobKhtQKNwxhgAGLcbDyDgAYQASgBRACCABVIwB9ZgAZUj4axZi1y11iA2oQCNwermSyQpx1Lx3pCE8tOouSNbO8PmyQXebt5Py9RAwYDRij9oL4ELEHs7cO7va0-eUyum6LmGuxuOzoFWaypKQ5AR8J3JziCASrJz0O1cDwCrhC+cvzm5HcG457fbqnEazVaHRQXQwvXv-JoE7Pn6s6qhiRiLpmSz4jm6zhNcATeEEjhBGSBrGvk0TWggN7UN4my+FS7L5KEd6jg+fDYMooZPjM-poGQbTYD2HBRrG4YAJoZjiWbQauubZI41Bss4-i+NSjgBI4ZxYYhng7OJaQoSWnj6qRMpjnwsBoAIozKLG3DJigzRoDAg7gpMIgjup5FiNpunsPphnGTAIEzAuJhLjxOp8QgiSCaEpJ+MWNLUoeMlNtQ+Z6KkPjOMkzjHEEanfDZfR2dODkGUZGAmWAIpih+ko-tKKX-mlOkZRgjnZblrnzuqHmQdqFAEuscVMm8po5IcOQIVWzzxR4NYhHoNb5FsyUwnK5VMHRDFMXlrEcVxy68fYubIaEQlvD1yS0rcjj9dFBbkok9w7aaVKTZ6cJaRVUBzYxzHJrG0bhrGCYAgAammK1eS1MHrraWRZC4aT3JJh1YRJBahEh2Q1myTxvJ410aTQPpIoGwYQGGUZxomALhgA4n9UHeetCA0s4kX3HcmQIy8UMXMcSTbmErZBXDElo6lgFToiwJoBQZAAF6gWZ-AWZCf7TfzQpCyL4szHVargY13HkwDPnPIycVkhybjRcjVbeJkQlScWLyeMknj7iR7ZkWVd0K1A1XOXlPBDtLVmldNLuKm7WUe6rYFk81rUHrWIkXq2duuAlJZVsEW0Hsk-hhFsnhbA8vPO+lgtB05OWmW+4qft+v5O-7BdIu7JdgKH7malrkduGzaSHAFFJ4VWpbXFkYTBBe0U5I4ec1-dWP0U9i2RmxnEQZrEcwQepokhhmejXh1JHUhOy9XtZ4BRnRRuj6EBwLYstDC3K8+euTw3CDYNsrkmxVmsKHuAnDx3CWJZ9Tj0dtZMqNR7IYDviuSmvhIooxCJkEITxQiYQuC6AspZEg1kiKaPQ1IJ5enAYHKBa1Vj3BpjbOKmxQhPASo4bw-V064REjWaKcUqSIQIXCH0fpsbyBIRTNc4Q5K2xcOyJsiRdhVnuCeLwrw4pmxpDWLhmloSQAEdrSma9rjhDNA8U0ElTRVlEvJbIBtmT6jtiojG3AsZBn4Z5VuMF25CSUfsE4idmaIApIJG2pxDj7GzokW8IC-ZdhohAjRrU1gBTkhabcyFyQ4ISlWBKJ5iw0IiGyFCyjQlTS9JRdg1FJzokegtKJgMUFyS2HtYIO5EJeCtBcZGJJnAUioQEnIqM8k3U0gXP09dcoVIfjSHYdsjSQ3JPhVBiAWlpHaenTpmRrEzUUGUnswzKYbEEr-dIUkJLpzEv1XquE0jpBEukEGAQVny0DsLMWoFNmrHNAfY4ZJHTblOKbUZfhs5uHzCnMkKyA6F0GTAJ5hIKTuFLHoDk+YlG21NoNfc9Csi7C2Hs4FtdgTrLABChA38ab7JeGEc6tIGFYRCCJXCNCXSnDfpsVwZ8ChAA */
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
          description: `Organização encontrada`,
          actions: "saveOrgToContext"
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
        CREATE_ORG: "creatingOrganization"
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
    },

    creatingOrganization: {
      invoke: {
        src: "createOrg",

        onDone: {
          target: "savingOrgToStorage",
          actions: "saveOrgToContext"
        }
      }
    },

    savingOrgToStorage: {
      invoke: {
        src: "saveOrgToStorage",
        onDone: "started",
        onError: "savingOrgFailure"
      }
    },

    savingOrgFailure: {
      on: {
        RETRY: "savingOrgToStorage"
      }
    }
  },

  initial: "findingUser",
  predictableActionArguments: true,
}, {
  actions: {
    saveUserToContext: assign((_, event) => event.data),
    saveOrgToContext: assign((_, event) => event.data),
  }
});
