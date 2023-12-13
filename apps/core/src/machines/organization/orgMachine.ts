import { assign, createMachine } from "xstate";
import { Organization } from "../../models/organization";
import { Member } from "../../models/member";

type Events =
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'ADD_MEMBER'; data: { ip: string } }
  | { type: 'ACCEPT_INVITE'; data: { code: number; member: Member; publicKey: string } };

type Services = { 
  getOrg: { data: { organization: Organization } };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
  sendInvitation: { data: unknown };
};

type Context = {
  organization: Organization,
  orgInvitationCode: number,
};

export const orgMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAOgDNiJioB5dAYgmRNOIDdkBrMtTXQq0pFqROugQdkOLABcCLANoAGALorViUAAdksAvJZaQAD0QBGZQA4AzKWXKAbAHYALMvMBOZ85s2ANCAAnoiOyqQArA6uruY2jja2AEyOngC+aYF82PjEZMKi4lAMYKioaKTaADZy5GgAtqTZAnkUVDT0UJJEnDKGRBoaxrr6-cZmCK6eVqTmUcquzp7KvlZJygHBiDauduZWtmF+Do5eGVnoOYJkRMidAGLIAK4iDADCAEoAogCCACpfAD6tA+AHEhkgQCMDAoiONEL5HKQ-GtEhEInMHElAiEEBErM5SK4MTZzM5lElbOYkq5ziBmrlWDhUGA5B10FgiAQAF5slhMFhkKQ8JqXFpMllssSdTk8vlEbq9eWDNTDPQwoyQiaWMKkVIuGwpKzKTyefY4hFWCJ6ylWZbKCKeCKnGx0hnXUjM1nyaUcrm8-olMoVaq1Bqi-iMsheqVFWUB2GK6TKtQQnTqsZahG6mLk5wJawLTwWhCWOKkTxJJaUhI2axnTL0sVR0iwLDsdlQP7IADKsjQWBgAtYwt4zY9bY7vq7vf7qEHYCTfVhKs0kOhmdA2t2dkcNKsZOdVkcjuLW0m5fMU3WcSSTrvtjd49ak873b7A6HpXKqEqNVkdSoI07ovu2b6zp+i5SMuSipqq64ZrC8Klo4BJEk4Hh1u4zjYuenixJEJKxK4xpmmsT6RhOYHTvcWAEFUTwsgw3x-B8ACaaZQohmpbhYiyePYriOC66wRDhPglmWSREvsUyJLYFIeBRVytHwAAyyBYBAkBsBAVRgAwPwACJGYCGBfBgABCXwfJxG5IVmCBJJS1oEksJ7WEkOwlhENiEjEninKa8Ton5ynimOUAaVpOmwGAIg0AAkj0BjysOQo9NwkUqaw6madpECtvFhTJR2sjykuKbqPB6ajA5vFOUsMzOEeCSmrsx4RCWByuHq6KOjsUQ2Ke4UtnlMWFXFCViKVqWBt+Ib-oBwHPrl6DRQVRXTVAs3lf0lX9Kuap1TxpiIDSJ72BEQnxGSxJCZJSTmOYpBVvm+LeKRSyjR642bQA7nRPpQB8cC6EQcWGW8bxfAACn8gKJQAcgAaolAJ2dxcKOX5Uz2Ckji7PiV7TJsuK+b1wkuseF35ukjYgWtUX5bFxWdsldTpWwmUiozkUbaz22dBzyAHSucFrrVGrYw1OwrLMUS+Z48TDSaJZ3kivmKfmlLvREGSNrc2nwJCfPHdLyEopEgWVl5ZonlWJYALTUkiSx+F51iuFWvmugzq35O007m5uZ0IIkms285Nj2xEjvnl40k61rNveM45g-ap60sxAIf1WH0eEm5gVRKiriSfir3eFeLg+F5qGZ6wtwPM8Ih56dEyoYSBpREaTiOrhuLuNJjqFpYKRx35jiN9GkrAzK-ryu3Mth6sMn4i4RzEtYJY+HYFJx6hOyxPEzgz621FFO+c4LsvyFXtYFbuIaOy+I6XXnu5erUi112GoFe5z6vhonRBiLI76OXMKhJElJ1iYXkn4ZwkkoFJxjl4awCQ1iUnPnwN4c9YRfDKBAhq+YXqILcANHwDtkF7lIL4M0LUHCBQJEkHB2cJq6X0sQgudZXJWFiPhYkVZhrq3wq9K8+J6HHhNH7C4lEs7Mw4VNEqKU9r53sh3c6dYk4JGek6OIVpy7njWGQ-qbgrQElCmwxRAMgY0FBrAcGcVuETAjtaKBtspgngEWTRABw7CxGNHaDxqQvLWIFoVDgc1YRI2QLIHs8VZAuPOr3ewYRfKnGuhSWwkkSLhA2MrK00w7SpCsOEnOW1CjCyIHUZJ4clgvQ8E6Q+7VKTqxiHQnCcxfZWhwtYA2aQgA */
  description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- A organização`,

  id: "orgMachine",

  tsTypes: {} as import("./orgMachine.typegen").Typegen0,
  schema: {} as {
    events: Events;
    services: Services;
    context: Context;
  },

  states: {
    findingOrg: {
      description: `Verifica se o usuário já participa de uma organização`,

      invoke: {
        src: "getOrg",

        onDone: {
          target: "orgLoaded",
          description: `Organização encontrada`,
          actions: "saveOrgToContext"
        },

        onError: "noOrgFound"
      }
    },

    orgLoaded: {
      states: {
        idle: {
          on: {
            ADD_MEMBER: "sendingInvitation"
          }
        },

        sendingInvitation: {
          entry: "generateInvitationCode",

          invoke: {
            src: "sendInvitation",
            onDone: "waitingResponse",
            onError: "invitationNotSent"
          },

          description: `No convite de ingresso na organização, envio o meu nome de usuário e minha chave publica`
        },

        waitingResponse: {
          on: {
            ACCEPT_INVITE: {
              target: "sendingOrgInfo",
              description: `O aceite de um confvite tem o codigo do convite, o membro e sua chave publica`
            }
          }
        },

        invitationNotSent: {},
        sendingOrgInfo: {
          description: `Envia as informações da organização`,

          invoke: {
            src: "sendOrg",
            onDone: "idle"
          }
        }
      },

      initial: "idle"
    },

    noOrgFound: {
      on: {
        CREATE_ORG: "creatingOrganization"
      }
    },

    creatingOrganization: {
      invoke: {
        src: "createOrg",

        onDone: {
          target: "savingOrgToStorage",
          actions: "saveOrgToContext"
        },

        onError: "orgCreationErr"
      }
    },

    savingOrgToStorage: {
      invoke: {
        src: "saveOrgToStorage",
        onDone: "orgLoaded",
        onError: "savingOrgFailure"
      }
    },

    savingOrgFailure: {
      on: {
        RETRY: "savingOrgToStorage"
      }
    },

    orgCreationErr: {}
  },

  initial: "findingOrg",
  predictableActionArguments: true,
}, {
  actions: {
    saveOrgToContext: assign((_, event) => event.data),
    generateInvitationCode: assign(() => ({ orgInvitationCode: 345 })),
  },
  services: {
    sendInvitation: () => new Promise((_, reject) => reject()),
    sendOrg: () => new Promise((_, reject) => reject()),
  },
});
