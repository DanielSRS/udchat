import { assign, createMachine } from 'xstate';
// import { Organization } from "../../models/organization";
import { User } from '../../models/user/user';
import { Organization } from '../../models/organization';

type Events =
  | { type: 'CREATE_USER' }
  | { type: 'CREATE_ORG' }
  | { type: 'RETRY' }
  | { type: 'START_OVER' };

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
  organization: Organization;
};

export const startupMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMBOKCuAHAsmgMYAWAlgHZgB0AZpRJVAKqxgYDEEA9ldZQDduAaxqpMOAsXJ96FRhRZsMCQdyJoUZXgG0ADAF19BxKFzdYZLb1MgAHogBMANgAc1RwFYA7Hsd6AFgBGIIBmH29nABoQAE9EUO9qAE49ZzdXT08g1wCAtwBfApjxLDxCUkoaOQUldg52DG4MalwAG01aZoBbalLJCplqhiZWdlUKIQ1rCmNjW3NLGdsHBABaR0dk6gDEv2c9MM9XPVcY+IQtoOofR1DXROSgvUPXbyKS9DKpStkRxQA8hgoFxeDQ1KI+l8BtIqnR-lAgVAJlNNNpZoZ5kgQIsrOiVohng9qC9nN4Aodkt5vKFQudEAcbi88mFnPdQi5kh8QP1yrC-vImEiGhgmi12p0elCJHzfsNBYDgSj1GjdJjDAsLHibNjVgFku4gp5md5UjTXP46XEErtqDkHgdaaSglzijzobKhtQKNwxhgAGLcbDyDgAYQASgBRACCABVIwB9ZgAZUj4axZi1y11iA2oQCNwermSyQpx1Lx3pCE8tOouSNbO8PmyQXebt5Py9PqRgeDEDDUbjiYB4YA4hmcVn8TmEDTnNRaRb7lkjS9HFXjkkAtlQq2-A8go4AtyO4M4UQMGA0Yo-aC+BCxB7O+fL9e6io1NN0XMNdjcdnQFWNYqRSDlt28E5yWcIIAirE49B2VwHgCVwQnzVDnBPJ8zz4C8ry0G9lBFMVWg6FAugwXpT35Gg8LfP1lS-NUjF-TMlmnQDc3Ca4Am8Q8gjJA1jXyaJrQQDDqG8TZfCpdl8lCLCZWfPhsGUUNXxmf00DINpsEvDgo1jcMAE0J3-Dj7FzbJHGoNlnH8XxqSPRwzjEvjPB2Jy0gEktPH1RTvhwsQ0AEUZlFjbhkxQZo0BgO9wUmERHyUoK+hCsL2AiqKYpgRjVQxFiTD-KcdU4hBEhs0JSX3WTqVgtymwXClUh8ZxkmcY4ggCmE5TS0LCMyyLoowWKwGI5pSMlSjpUCmi+oyjAsuG0a8pmH8irY7UKAJdY2qZN5TRyQ4cl4qtnnajwaxCPQa3yLZus9OFYHSxQtJ0vSxsMkyzJK7aZw2MJbLeY7klpW51zE86C3JRJ7mB00qQe5Tgv6qA3t0-Tk1jaNw1jBMAQANTTH72NKyz1lLUIbiyTwXDSe4Ak2KsjwLXcvCNUI2SeN5PCR1K6IIxFgTQCgyAAL3y+L+ESyFqN6gWhWF0WJZmVbv3VDbJ1Jv6yueRk2rJDk3D0EscirCCPPspDUhu5JPGghT22wubntRpElpysaeHvGXktm3rXcVqAPZG3LP3y9bNW1naYNreyUNbe3XA6ksq2CKmYOSfwwi2WmDUdz4Updl6heDobPfG8UyIoqjnYDkv3fL0OwDV5iSa2mO3C3NJDiqikpKrUtrhXfMYJObnHD54u3eBdGPoMyMjNM1itY7mcYNNEkRJzm6pOpM7Dhs4JclBpCquzqf5Y0oORfFyXGgmiVyKlOWvQVxUoFvlX0Vbgr24A8mkQEJ5EcmyU4gRkgH0BlnU0Lk2RVVQq6N0PoIBwFsK-KoUc15lWAk8amWQ6ZslyEzMSawBLuGTg8fMN1iywMvl6GoC0sEANWL4BcPMQiZBCE8TmZ1SwpF2E2RIgk9DUnoXCRhH9mEWVWPcecnh2pZzuE8DqjhvB8JspELwVVFFUj4uIvgPo-S9nkNIsmQFwgeTti4dkQiYZVnuAhLwrw2oQRpDWAxfsUCQDMTrcmG9rjhDNA8WBvFIFiQcp5bIhtmT6ntp4703AexBlMcVaOM4u62XcfsE4KcIYXApDZBR4DnguFpsIhJ793y+J2msKqHkLTbkcK2XiZIOpVg6ghYsoQ7bUjZAJDxTsi69VUuwdS+F0Rz0vDU-6nMPJbFBsEHwbxDw1kHjkEkzgKRtWzq8XmQz-ZekDgNRaTdRozJwTSHY9sjSMzUXcyI6z3BpG2VnQ4eyEnHLRtpDGYALnkw2DZSh6QXJHhgaIs6J1JJpHSPZdINNjwHJ6m-a+H8v75X+aw+4OwjTJyAfmY0rkLjUipn4Wmbh8zpzJJ8huwIQ7nLSdg-xFJ3Clj0ByfM7i7bmwutBNRWRdhbBBTSme3z3rTMZSwwkbh5ygpeGEOGtJ1GQwEponpLpThEM2K4BJzQoDjPypGUUmLECRECYkckCiLWqMhfZSS6qmwvHam8SeRQChAA */
    description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- O usuário (e suas chaves)
- A organização`,

    id: 'startupMachine',

    tsTypes: {} as import('./startup.typegen').Typegen0,
    schema: {} as {
      events: Events;
      services: Services;
      context: Context;
    },

    states: {
      findingUser: {
        description: 'Verifica se existe um usuário registrado',

        invoke: {
          src: 'getUser',
          onDone: {
            target: 'findingOrg',
            description: 'Se o usuário foi encontrado',
            actions: 'saveUserToContext',
          },
          onError: 'noUserFound',
        },
      },

      findingOrg: {
        description: 'Verifica se o usuário já participa de uma organização',

        invoke: {
          src: 'getOrg',

          onDone: {
            target: 'started',
            description: 'Organização encontrada',
            actions: 'saveOrgToContext',
          },

          onError: 'noOrgFound',
        },
      },

      noUserFound: {
        on: {
          CREATE_USER: 'creatingUser',
        },

        description: `Informações do usuário não foram encontradas no storage.

A unica opção para prosseguir é criando um novo usuário`,
      },

      started: {},

      noOrgFound: {
        on: {
          CREATE_ORG: 'creatingOrganization',
        },
      },

      creatingUser: {
        description: 'Gera as chaves criptograficas e o membro',

        invoke: {
          src: 'createUser',
          onDone: {
            target: 'savingUserToStorage',
            actions: 'saveUserToContext',
          },
          onError: 'userCreationFailure',
        },
      },

      userCreationFailure: {
        on: {
          RETRY: 'creatingUser',
        },
      },

      savingUserToStorage: {
        invoke: {
          src: 'saveUserToStorage',
          onDone: 'findingOrg',
          onError: 'savingFailure',
        },
      },

      savingFailure: {
        on: {
          RETRY: 'savingUserToStorage',
          START_OVER: 'findingUser',
        },
      },

      creatingOrganization: {
        invoke: {
          src: 'createOrg',

          onDone: {
            target: 'savingOrgToStorage',
            actions: 'saveOrgToContext',
          },

          onError: 'orgCreationErr',
        },
      },

      savingOrgToStorage: {
        invoke: {
          src: 'saveOrgToStorage',
          onDone: 'started',
          onError: 'savingOrgFailure',
        },
      },

      savingOrgFailure: {
        on: {
          RETRY: 'savingOrgToStorage',
        },
      },

      orgCreationErr: {},
    },

    initial: 'findingUser',
    predictableActionArguments: true,
  },
  {
    actions: {
      saveUserToContext: assign((_, event) => event.data),
      saveOrgToContext: assign((_, event) => event.data),
    },
  },
);
