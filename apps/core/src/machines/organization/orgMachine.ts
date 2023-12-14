import { assign, createMachine } from "xstate";
import { Organization } from "../../models/organization";
import { User } from "../../models/user/user";
import { ACCEPT_INVITE, INVITE_ACEPTED_EVENT, JOINED_ORG_INFO, JOIN_ORG_INVITE } from "../../contexts/organization/orgEventTypes";
import { SendMessageResponseEvent } from "../../contexts/network/networkEventTypes";

type Events =
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'ADD_MEMBER'; data: { ip: string } }
  | { type: 'SET_USER'; data: { user: User } }
  | { type: 'JOIN_ORG_INVITE'; data: JOIN_ORG_INVITE['data'] }
  | { type: 'ACCEPT_INVITE'; data: ACCEPT_INVITE['data'] }
  | { type: 'JOIN_ORG'; }
  | { type: 'JOINED_ORG_INFO'; data: JOINED_ORG_INFO['data'] }
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
  sendOrg: { data: {
    type: 'sendOrg';
    data: {
      net: SendMessageResponseEvent,
      commit: JOINED_ORG_INFO,
    };
  } };
};

type Context = {
  organization: Organization;
  orgInvitationCode: number;
  user: User;
  /** Usuário que enviou uma solicitação de entrar em uma organização */
  invitingMember: JOIN_ORG_INVITE['data']['invitingMember'];
  ip: JOIN_ORG_INVITE['data']['ip'];
};

export const orgMachine = createMachine({
  /** @xstate-layout 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-YCz1yLzBckTVYBtVlERZNXe3t94Co-PKaE-oEZdEGOiYMwcejDE6P6VhHhHB+C8ujGk8A2hL2gQEup1gw6NOabotpKt2yBPRLa0yLhlgvkMIMFGar7bPBGugENtSQSuRmIqTQbhLmPg4htB5GgRTlQ8CMARGx1WxSGnm1F7phhejDr6JEAZy13M9AiToWIkTcNMYnFqe4CDpjAK2gVNY1SqCcMMeYy1XD4ofB+L0Nk2ZuHUCDcd51hqwTcSRWd9553ymbr6YwjMtrtgRMoTs-4BiR3qv+VVjas0TtTI4hlclYAKWnGe4yrkwzhs0M4Pi3gJTBj4Q4TEnQw4eA8DWA9cUoJpAQqIY0yBBAwsEMB+aUoDA9CmCKAkabuZ2SsI4aYSJeEgSxIqFQaGhr4WCslMayBCMA39BGoYEZlp1vhioSq8wHkBkhFcyOwqWOZoGt+pQl1ojXVuvdJ6qAePVmkJHLuaIYT9kebMWN9kfS7R0fVfsKH+ysfin5FKOG8MzgI8c0NIIdGYo-NZOQ+hlqVTTTMHTuJOINlYdCAZ8nfKC3QNjPGEAtOIDgd2NdBgQ6XxQe2QY8oQKdCGKl5a-oIufoGsXE11KRn-StfeeE8HIz9BxEBUT7Y1rdAMEJx1Cx+h4NXvsd+m8Z2ufzTRzoXdBhyjRGuiMUN3Ddk4qmhN7gNDdfaoQggxCDYJZDLEnTiJ77LC6P6DpGgHmlp0G+BEOm0P6kdi0SgxxNu8Uff6AYIFnt8QyxMH0x31r9ihO4ZVlLIU0sqyo4ywTLKRoJNGqUJnURLFG24foLyRhLF0ID4Z3zf3RBcYUzb9SBhhJ000yMVUnCqxm3iAwnrFRyjk8V5ZqSqVfKyWAHJeSClESKcgEp+w8eQl4g87m9VnDcNQTWVQa0w6rDTR+YckWtQQox-YmFsE-nwoG79NziBAleb0-+HsZ9PAvI6YoCEAxvAvOWCwjN9OFeM6BxVpQdKnH7CZcRPHCs-zOTDrukUph72rAhDp9QsJZfww-d5JtyRFdrMd7gXZ6vHP4bxx+MM3h0RUebGmjiTqZjy2cD7tNXX5carAFq9qm2fSQlUHDH0DlpcwfbEYLum0XA3pGAGX1PggA */
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
            onDone: {
              target: "idle",
              actions: "saveUpdatedOrg"
            },
            onError: "orgInfoNotSent"
          }
        },

        addingNewMember: {
          on: {
            ADD_MEMBER: "sendingInvitation"
          }
        },

        orgInfoNotSent: {}
      },

      initial: "idle",

      on: {
        DELETE_ORG: "deletingOrg",
        CANCELL_ORG_JOIN: ".idle"
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
            onDone: "WaitingOrgData",
            onError: "aceptanceNotSent"
          }
        },

        WaitingOrgData: {
          description: `Aguarda o envio das informações da organização`,

          on: {
            JOINED_ORG_INFO: {
              target: "#orgMachine.orgLoaded",
              description: `Aqui recebo as informações da organização que acabei de entrar`,
              actions: "saveNewOrgToContext"
            }
          }
        },

        aceptanceNotSent: {}
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
    saveUpdatedOrg: assign((_, event) => ({ organization: event.data.data.commit.data.org })),
    saveNewOrgToContext: assign((_, event) => ({ organization: event.data.org })),
  }
});

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
