import { assign, createMachine } from "xstate";
import { Organization } from "../../models/organization";
import { Member } from "../../models/member";
import { User } from "../../models/user/user";
import { ACCEPT_INVITE, CANCELL_ORG_JOIN, INVITE_ACEPTED_EVENT, JOINED_ORG_INFO, JOIN_ORG_INVITE } from "../../contexts/organization/orgEventTypes";

type Events =
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; }
  | { type: 'ADD_MEMBER'; data: { ip: string } }
  | { type: 'SET_USER'; data: { user: User } }
  | { type: 'JOIN_ORG_INVITE'; data: JOIN_ORG_INVITE['data'] }
  | { type: 'ACCEPT_INVITE'; data: ACCEPT_INVITE['data'] }
  | { type: 'JOIN_ORG'; }
  | { type: 'JOINED_ORG_INFO'; data: JOINED_ORG_INFO['data'] }
  | { type: 'CANCELL_ORG_JOIN'; data: CANCELL_ORG_JOIN['data'] }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgKQg5zIAEEACLM2gYSgYABClFYnEa-ABonEIM0KkMql0sLUswRaPGiEM8l0DmcBM8i0MSt0RJJ23u6Ep1NpsDARWiAEkPkJqoCEkkUh9MtlNo8yYaqTSIEpTeaSlbUjaWu9PrbapxfrxBS0RTJYeDdIY1Oo3Fp0epDAqEFibEoZVqtGjZvJDJ5da7SS6oEavT6zcUoAGg3ajidUGdLoJrqg7nqnhTPSb65brYIw0QQ5Vxz9+X9o4DYwhpHYJWxDHZFrIBuu1FnZHJlNIpTKVC4VGwXFpy0FKwbq4PvQB3LAAkpMOB8Iim0gWgByADULWoShaEZABhSgAAVgOZSMQH+GM2hBZVnB6VZbBLFRZDBZEJiVXM1EIhR1GXfo1n8YkK31AdjW9X0G32K1rntUIKiyO8tn7D1aLrP1SkbIhrknL5ARnLg52aBckNRQYVUhNc3EWEsLyzbR7CVAw9A0FRdHza9ONCIhkH2AAxZAAFcilIMCmEoRlgNoGImAAcTghCpOBRBXHsXE5XFYwoWkLNDB0hxjEUfRpC6fcbH0t1kiM0yLKsgApGI-0cly3PnYVpNBXo82WXRT30LDsN3FFQVhJQosWJxlMULE4tvHBUDAW1XnQLAiAIAAvccWOSNiqwM5JWva4ROqgbq+vHYTpwjWco0k3LPIQWQ+mmDx+nkVZz08TEs2KiVtNPXpSyTBRmv1caOv4mb+paQ5jlOC4rluDj4qUW7JvunrHsBebvkW8TlqFIF2gQXTpnmfRdLxc9nD3IZui0I80ZTBHCQovtQlgLBAym6hkHIQQ0CwGBBsddJ2Nx5J8cJ-jidJ8mYCB0SQYFFaIZBbDcTzZcsMTZMZU8LMFghZxEQUbRDG0LprqeBm9nQZmydQCmyFbV7O27XsqKVgmVagNXWbAdnw3qJb4JynmrGTFVBimBRoT0ILKrTZQtQUbxHAvTFpEVvGjamkyX3Ocy2tIWzqCYABNbLucXbDquhIjdrXXQj10ZH9wcTFnGWLpNN8HGDdCFLkGIRkiH2B6BrAxlfwg8lyUy5zaDSv9E-B5ONpqrOQshDb5l6LQsyWex-K6fRbCTaR5CD5JK+r2uuv+8clGfV8oDM1Am0EMgu9-dvaD-QDgJ7xC1oAWkhc8elPIe5exQwc8qkW8wJXQC59pxA7LjefUK8iA1zrhvFoSh3w4DAAQVIkAD5gGJiA-YpBwIQWgmfACQFKBXw8pDO+F0ao6WsBtf20gkx7hHg4NGxhYRvx0IsJeSgQFgPXrNSB5BhwlEZDAngY4iAwKpsNT6t5WFr2mhAwESguF8V4WAfh3UYEWyIGJLmvc8o3ycLmTE1glSpgGO-CYZDcywgRrpYqmJDDMPEeAjh0iADqL5fr7GZNULApBj6UDZE5Duf4TIxDwatAhWhhhKELAvDwWhva7RUBPN+DhFCIk8IRGwSoVB+AokZGk8A2h03UdfAh1hQnEJ-gSMe+5KGVTvqsJQZjYkDExO4OWzDCgMXQAU-ByF1AzHcGjBeoSZRHj3GjOpGgNJ9JGKXDYQCuL3lop04JooF4qh0tKWUC8bB7gSReH+RcCTLlWMwmitYCD0jAIsu2S48QShzMMeYctXCZkqtoXMcg0k6TcOoC8i9AGjTvDWIcfED7jkuYuBeBgxmKGGOFcUWzKoImUCWLUAxxQ6S1L8mZ-yTm0m3r9d8sBPymjBXlZYMoIQeE0GqdcwxcKICxN0bw55TzFMpZiyisz3TzNOaOccv5kCCFkYIEla0KGQs2kqAk64DBdD3H7HoilxRaCxH0jJfyvo4rotw-iTFkAishsqEpQxolyyiTYKKql5h1KzpCfR4os6dGYYldAZlLIQH1SCB2eYnkGGTH0Us7sJiDGkL0zoQxfVy2VGoZhP1jb10Ke5JZXllj5xCmRJEaTOhHVcGhU1XR5gKH6Mw5WRMSbq01h6qwgxwRpiRJsp50SjruDzPuRM65druA0MWkO-Ew4EAjm1St61P5RURCjIuuIjFWGsCG1woSdApgRFFY56AwJtXHJQY4Q7dJIuVNuQsx45ZUI0HUtwW4oTuB0gArFX1bHsIBsExNVy74YVKaQipFCKoTCUuE9EaZzXQgA9Y9VYiq6gIkfG6ReLoh70QUOwhAxH5RR-iFNSThxbNrxAYZUpYPCxJsWBthkj7GiCgWAGBcCEGjiQcgFBHSJIaNvpCXSdSZU6WcEyrMaNuhrNCasdcaYXAEdXnYh9RAZHavkYowRFyGOFJBDfNMNbkXJiFp4YqVDFAQgGN4YqyxERamE+B0Tm8nE71ce4+DJU8xJg8AoZVSpTAItqfuLE-QvBpgXkZojkHSMgMgPsKzBV1DKsUGjeYaSnN4TRDMaE7zOgmtxJknwQA */
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
        }
      },

      initial: "idle"
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
