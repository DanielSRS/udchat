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
  | { type: 'JOINED_ORG_INFO'; }
  | { type: 'CANCELL_ORG_JOIN'; }
  | { type: 'DELETE_ORG'; }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgKQg5zIAEEACLM2gYSgYABClFYnEa-ABonEIM0KkMql0sLUswRaPGiEM8l0DmcBM8i0MSt0RJJ23u6Ep1NpsDARWiAEkPkJqoCEkkUh9MtlNo8yYaqTSIEpTeaSlbUjaWu9PrbapxfrxBS0RTJYeDdIY1Oo3Fp0epDAqEFibEoZVqtGjZvJDJ5da7SS6oEavT6zcUoAGg3ajidUGdLoJrqg7nqnhTPSb65brYIw0QQ5Vxz9+X9o4DYwhpHYJWxDHZFrIBuu1FnZHJlNIpTKVC4VGwXFpy0FKwbq4PvQB3LAAkpMOB8Iim0gWgByADULWoShaEZABhSgAAVgOZSMQH+GM2hBZVnB6VZbBLFRZDBZEJiVXM1EIhR1GXfo1n8YkK31AdjW9X0G32K1rntUIKiyO8tn7D1aLrP1SkbIhrknL5ARnLg52aBckNRQYVUhNc3EWEsLyzbR7CVAw9A0FRdHza9ONCIhkH2AAxZAAFcilIMCmEoRlgNoGImAAcTghCpOBRBXHsXE5XFYwoWkLNDB0hxjEUfRpC6fcbH0t1kiM0yLKsgApGI-0cly3PnYVpNBXo82WXRT30LDsN3FFQVhJQosWJxlMULE4tvHBUDAW1XnQLAiAIAAvccWOSNiqwM5JWva4ROqgbq+vHYTpwjWco0k3LPIQWQ+mmDx+nkVZz08TEs2KiVtNPXpSyTBRmv1caOv4mb+paQ5jlOC4rluDj4qUW7JvunrHsBebvkW8TlqFIF2gQXTpnmfRdLxc9nD3IZui0I80ZTBHCQovtQlgLBAym6hkHIQQ0CwGBBsddJ2Nx5J8cJ-jidJ8mYCB0SQYFFaIZBbDcTzZcsMTZMZU8LMFghZxEQUbRDG0LprqeBm9nQZmydQCmyFbV7O27XsqKVgmVagNXWbAdnw3qJb4JynmrGTFVBimBRoT0ILKrTZQtQUbxHAvTFpEVvGjamkyX3Ocy2tIWzqCYABNbLucXbDquhIjdrXXQj10ZH9wcTFnGWLpNN8HGDdCFLkGIRkiH2B6BrAxlfwg8lyUy5zaDSv9E-B5ONpqrOQshDb5l6LQsyWex-K6fRbCTaR5CD5JK+r2uuv+8clGfV8oDM1Am0EMgu9-dvaD-QDgJ7xC1oAWkhc8elPIe5exQwc8qkW8wJXQC59pxA7LjefUK8iA1zrhvFoSh3w4DAAQVIkAD5gGJiA-YpBwIQWgmfACQFKBXw8pDO+F0ao6WsBtf20gkx7hHg4NGxhYRvx0IsJeSgQFgPXrNSB5BhwlEZDAngY4iAwKpsNT6t5WFr2mhAwESguF8V4WAfh3UYEWyIGJLmvc8o3ycLmTE1glSpgGO-CYZDcywgRrpYqmJDDMPEeAjh0iADqL5fr7GZNULApBj6UDZE5Duf4TIxDwatAhWhhhKELAvDwWhva7RUBPN+DhFCIk8IRGwSoVDMJol6UgzJKDkhoCBXxQS7brRLOpRYkUPB4goapXaqh3A6A2sufQSZmE0gZC4+IiRWJOlpuXZI7SwCdKgCotREkNFrTTNIHo6Is5uC6IMdEWZdr2CGDoGeb8PCOD8BRIyNJ4BtDpuo6+BDrChOIT-AkY99yUMqnfVYSgzGxIGJidwctmGFAYugY5+DkLqBmA0zQbg9FHj3GjR5GgNINJGKXDYQCuL3loj84JooF4qh0tKWUC8bB7gSReH+RcCTLlWJk7itYCD0jAMikpC81yqCcMMeYctXCZkqtoXMcg0k6XmVMQspLEW1noiOQMY4TnuRRTIapELFDDHCuKHFlUETKBLFqAY4odJakXoA0ad4ay0m3r9d8sBPymmpYuZYMoIQeE0GqdcwxcKICxN0bw55TxnOtVquFOqsm0jSM2UQv5kCCFkYIM1eUKEGB6FMJUBJ1wGC6HuP2PRFLii0FiBpGTtVfR9XRbh-EmLIDDWtZU5y1lalWF4KKql5iPKzpCfR4os6dGYYldAZlLIQCLZDB2eYWUGGTH0Us7sJiDGmaWToQx+1y2VGoZhP1jb1zFbbRc8J84hTIkiNJnQjquDQnLZMaIFj9GYcrImJN1aay7bzQY4I0xImxSy6JR13B5n3Imdcu13AaBPSHfiYcCARzale+2-yoqIhRkXXERirDWGma4UJ6ylgIiivysCbVxyUGOMBqGBIlBQe3IWY8csqEaEecCxMY8HYAK9V9Wx7CAbBPFSUu+GELmkOuRQiqEwlLhPRGmGwiJ5iImsVmsRVdQESMXdIg10Q96IOw4QgYj8oo-xCmpJw4sX14gMMqUsVSUOieAeJthkj7GiCgWAGBcCEGjiQcgFB3zxknJBIp+wkUsQDE9nEj2C9JSwn3DKZwzgdSGaeHR0zDGiAyLzfIxRgiqVOd+YgG+aZb0quTELTwxUqGKAhAMbwxVljCZEzRsTq87GRaUE4nerj3EKZKnmJMHgFBpqVKYRVDz9xYn6F4KZnrKLworsZyTUjzMgMgPserBV1BpsUGjeYaT2t4TRDMaEnLOjRP0W0sAHTjbYdkAdiUCJvCQjRKsUsDqlyQnCasYL4URhZx2T4IAA */
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
