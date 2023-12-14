import { assign, createMachine } from "xstate";
import { Organization } from "../../models/organization";
import { User } from "../../models/user/user";
import { ACCEPT_INVITE, INVITE_ACEPTED_EVENT, JOIN_ORG_INVITE } from "../../contexts/organization/orgEventTypes";

type Events =
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'ADD_MEMBER'; data: { ip: string } }
  | { type: 'SET_USER'; data: { user: User } }
  | { type: 'JOIN_ORG_INVITE'; data: JOIN_ORG_INVITE['data'] }
  | { type: 'ACCEPT_INVITE'; data: ACCEPT_INVITE['data'] }
  | { type: 'JOIN_ORG'; }
  | { type: 'JOINED_ORG_INFO'; }
  | { type: 'CANCELL_ORG_JOIN'; }
  | { type: 'DELETE_ORG'; }
  | { type: 'NEW_MEMBER'; }
  | { type: 'INVITE_ACEPTED'; data: INVITE_ACEPTED_EVENT['data'] };

type Services = { 
  getOrg: { data: { organization: Organization } };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
  sendInvitation: { data: unknown };
  sendInviteAcceptance: { data: unknown };
};

type Context = {
  organization: Organization;
  orgInvitationCode: number;
  user: User;
  /** Usuário que enviou uma solicitação de entrar em uma organização */
  invitingMember: JOIN_ORG_INVITE['data']['invitingMember'];
};

export const orgMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgSmpxSgADkwAB3DBgG4AIyOpAAggARfm0DCUDAAIUorE4jX4ANE4hB0jxNh6WmWSzUTkMcmk40QA3s-WkNiV7l0hgRhiJJO293QlOptNgYCK0QAkh8hNVAQkkikPplsptHmT7VSaRAlM7XSUPakvS13p9vbVOL9eLKWgqZLDwebNUsvOrDHqEFiVWpDFW1TZZvJDJ5rcHSUGoA6I1GXQy4wmfUcTqgzpdBNdUHcbU8KeGnV33Z7BCmiEnKouftK-pnAdmEMbKz1DHZFrIBge1KXZHJlNJdLpKyoXCo2C4tE2gi27W3p5GWVgASUmHAfBEM6pBuoyABqbrUJQtC8gAwpQAAK0H8umID-FmbQgvIAxaD0qy2PWKiyGCyITIYaJKGo1EKOou63i+-jEs2tpTo6kbRgy+wetcvqhBUWQflsk5huxnYxqUUA8cgy5fICa5cBuzRblhqKDLoEKzBRapLLMWilto9gUQYegaCot5Vq+wmhEQyD7AAYsgACuRSkHBTCULy0G0DETAAOJoRhKnAvqixKLiCLLFWkK9LqKIIBaGm1gox4GF0F42FZIbJLZDnOa5ABSMRgT5-mBZu8qqaCvRUcsuj3voxEkWe8Uwnh0jYk49ZIpiKhZe+OCoGA3qvOgWBEAQABei58ckAmttZySDcNwijVA41TYusmrmm64ZsplUhQgsh9NMHj9PIqyPp4mKlvVhhUR1969A2hgEvI-W2stI2SRt00tIcxynBcVy3EJ2VKN9q2-RN-2Att3y7Yp+1ykC7QILe0zzPot54o+zjnkM3RaNeJPqLinSEkxE6hLAWDxmt1DIOQghoFgMCzf66SCTTyR0wzklMyzbMwAj8lIzKB1oyCJG4o9jjHm96gNvprUKBCziIgo2jaloXSfU8-N7OgQus6g7NkP2wPDqO44sYb9PG1Apsi2AYupvUe3oRV0tWJqSWnQo0J6HFExaN4MzGGiJHXZi0gG7TjtrfZv7nE5Q2kB51BMAAmuVUvbiRsI9HY72IoYujXrohMXg4mLOMsXQmb41P26EBXIMQvJEPsf0zXBvKMgh5LkqVfm0EVYH56jhcnUo17SBakInfMvSqxMGqqFWXT6LYb1KgnyQd13PdjbDi5KD+f5QI5qA9oIZCT4yY+0GBkHQdPmFHQAtJCj49PeJe2psQV1LAWKiBJdD1wUI4E0h8lDHyIN3Xu58WhKAAjgMABBUiQHvmAJmiD9h8jgghZCr8IJQUoJ-YK6Nf6vXnuZawJ0nwXjeueFeDgSbGFhBXHQix4GIOQWfTaaDyCzhKLyTBPAFxEEwZzea4N3yCNPutVBgIlBiIkpIsA0jxqYPdkQBSksZ5VW-k4FUmJrAUTcC4GEhNoRKFhHjW89VMRWlbm+W0yiUEiPUQAdV-NDfY-JqhYFIE-SgQpfLjzAvZGI1DDq0K0MMJQaolQeC0NFS6KgwEVwcIoREnhqK1mWPAtiEZSD8koOSGgMFokJN9sdesRlFj6FWGqAwJZ4pKmkKodwOgTrGn0G9eBNJzhgCCfERI-EAw8zbskMZEynYGKMUpExR1w69OhDhU0XRBjolLJdewQwdA7wrh4RwZTRIdgIBAcZpBGSUD8cKUUEopTI29gXKqSpOg9HqnoOsbgTyHLelRe8kCSYXk8LoPwTFbI0ngG0Xmxiv60OsMkhhUCCRr1YS1CYv9ViOLVIoTUVZqIGBbhsTxTxChcXQCimh2F1AzH6ZoNwVjrznhJo4jQxl+kjEpcxaloZPzsQZYkxUSoNI1hhMeJxsw8VWDyU+KBFdZgmnNB9Dxi0PztlpLc8Z4rGk-IeuWYY8xtSuC6RMbQKo5C1nMm4dQT4tVUp1eUmcEl76LiNduH5vTcayGGFHFQB5SwImUPWKsAxQ3mSrK6oV7rrm0ivtDACsAgLOl9VVYsEIPCaGcJWbwapw1dDro+e86L80Jt5rqr8XNeyiEZMgQQmjBDZqOovAwPQpgUQJAeNKZErCOGmEiNUoa9bgr1lc0VHZOJO2kh29GOEMUnKrO0zZOTunzEcZXSE1jQ2V06PA3K6BHIuQgEukE-sqJWoMJqPoDZQ6IEGL0hsnQhj3u1DhNQ8CoZOz7qioKErQrgm8BafoOJaydDuq4fC2pNRogWP0eBRtGbMzNhbK9w7fnhyREqGE9ZMl3XcFRC85oDyXXcBoVDSdJIpwIGnIa2HjrgI6oiImjdcTV3ikGjQjj2WnKWAiDqM64JDUXJQY4LHbyRpwieNUN5KzPuOtYAN7LzRr39vHbVENvHCLhok4DjTf6EUxUwnFi9FUIEWMTdE4cTTQkc+4t1enO5IJUYB9Rqboi3zwSxuhAwAEdVVQidwThSyFvCrFHCDYPDZIEe5oRqjfGiHQWATB2DcHznwcgQh9K1mopBIF+wbSsS4W8FusOSpVA3mSasA84cXCJZPj4wzRANHiKgNo3RsiwABfDuCNUZKsTHmhVVqwKUIQDG8PVZY5cXOJrc61gzF8AnX2CaEgLDUqJvQ8AoPWFFTDxQRPYC8WJ+heE2TW+ZCCkuebUWlxBkB9jbZquoPWigSbzGSqWCiKp1X2s6Jk6xoywDjMmVAFjQbISqGNEG-7DWS3dNhyTWwLgo4jErjOvVkZ6TRGZGyDk3JUAsc0KG1JSGoF1e6tZ4wkbV6MIYnIGFsKgA */
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
            NEW_MEMBER: "addingNewMember"
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
            INVITE_ACEPTED: {
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
        },

        addingNewMember: {
          on: {
            ADD_MEMBER: "sendingInvitation"
          }
        }
      },

      initial: "idle",

      on: {
        DELETE_ORG: "deletingOrg"
      }
    },

    noOrgFound: {
      on: {
        CREATE_ORG: "creatingOrganization",
        JOIN_ORG: "JoinAnOrganization"
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

    orgCreationErr: {},

    JoinAnOrganization: {
      states: {
        waitingForInvite: {
          on: {
            JOIN_ORG_INVITE: {
              target: "ReceivedInviteToJoinOrg",

              description: `Aqui chega o convite para entrar na organização.

O convite tem o nome de quem convidou e sua chave publica`,

              actions: "saveInvitingMemberToContext"
            }
          },

          description: `Aguardando o recebimento de um convite para entrar numa organização`
        },

        ReceivedInviteToJoinOrg: {
          on: {
            ACCEPT_INVITE: {
              target: "SendingAceptance",
              description: `Aqui deve ser fornecido o codigo de acite ao grupo`
            }
          }
        },

        SendingAceptance: {
          description: `Envia para quem convidou, a resposta de aceite do convite`,

          invoke: {
            src: "sendInviteAcceptance",
            onDone: "WaitingOrgData"
          }
        },

        WaitingOrgData: {
          description: `Aguarda o envio das informações da organização`,

          on: {
            JOINED_ORG_INFO: {
              target: "JoinedOrg",
              description: `Aqui recebo as informações da organização que acabei de entrar`
            }
          }
        },

        JoinedOrg: {}
      },

      initial: "waitingForInvite",
      description: `Entra em uma organização criada por outro usuário`,

      on: {
        CANCELL_ORG_JOIN: "noOrgFound"
      }
    },

    deletingOrg: {
      invoke: {
        src: "deleteOrg",
        onDone: "findingOrg"
      }
    }
  },

  initial: "findingOrg",
  predictableActionArguments: true,

  on: {
    SET_USER: {
      target: "#orgMachine",
      internal: true,
      actions: "saveUserToContext"
    }
  }
}, {
  actions: {
    saveOrgToContext: assign((_, event) => event.data),
    saveUserToContext: assign((_, event) => event.data),
    generateInvitationCode: assign(() => ({ orgInvitationCode: generateRandomInteger(100, 999) })),
    saveInvitingMemberToContext: assign((_, event) => event.data),
  },
  services: {
    sendOrg: () => new Promise((_, reject) => reject()),
  },
});

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
