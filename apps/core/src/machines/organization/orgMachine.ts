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
  ip: JOIN_ORG_INVITE['data']['ip'];
};

export const orgMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgpAAIpRyTRKLQYkwAOK-Xj8AGicQghSGeyGRb6VZaPHSQzjGTyaSqdw6WQGGFsIVEknbe7oSnUyApCDnMgAOUoAHVaBhKBgAEKUVicRo8lr82WdHq6FR6Wa4lw2aUohDyIVKNQqdyyWFybQuDWbR5knVUmkQJSwMBFaIASQ+QmqgISSRSH0y2XjpLLUF1KbTGeKUBzqTzLXen3ztU4XJA-xdbRB0lh4N0QvUbi06PUAYmWJsocM84l-qRhk8caCFe1VeT+vTmZKjebBaOJ1QZ0ugmuqDumqeFO3qd39YPgnbRFblVfP0df2dgNdCGkOxDB6Qw7EWSN-TsGUEFkORlAHXQ1EMcNPTYFwtDXLZbyTPVUwAdywAESiYOA+CIdNSCzY0ADUs2oFkAEEAGFKAABXoukux7P8+1RAYtB6VZbGDFRZDBZEJhFWc1BkhR1EA-o1n8Ylyy1O9cNrPdSgbIhrkLUIKiyTcsMTLcNMfPZ0Bza53y+QEvy4H9mh44FUUGXQIVmEUJSWWYtGg7RhUlPQNBURD50whNK2rfVqXrY0wDwjAwBuAAjI5SAYuk6Uta07QdRzuWcvleIAvFZzQ5YljDf1o2ggZ7H6QDpDcfpkKlSKNyIZB9gAMWQABXIpSCYphKAY+jWQ5LjfxK1yEFcexcQRZZ50hXppGg5CPP9BRIwMLpYJsTqtW6vrBuGgApGIqKmzlvyK3kgXaUFelDZZPRcTpZDEtRoJhATpGxJxgyRTEVBOp4cFQMB81edAsCIAgAC9X305JDMrEzkmh2HhHhqBEZR19bM-TsHu7WbnoFPppg8fo5TDNCtExeqVGA0Lw16FchQUSHQlxuHtKJ1GWkOY5TguK5bmMqKlEF-HhaR0XAVJ75ycKyniupxBEOmeZ9EQvEvWcaDlQUJQtAHK3R2NwllJvUJYCwJsCeoZByEENAsBgdHi3SIzHeSZ3Xe093Pe9mA1fsjWnW1-8xNxUNANE4cwyQzx-otsSraGOUtEMbQun54OXcsqBw691AfbIY9JfPS9r1Up4Q-LyvI7AaOO3qCnuLml7rDChxaYUaE9E2wNx2UNa0TEr0WYREu0zLgnesI84Bph0gxuoJgAE0Zvj0qxNhHo7AJOU1V0BCzaGeVvCcCUsWC3wHeb0JLuQYgGKIfYRbRpiDFjQsXJOSO6tBrpUUPk9BOyolADilKJYw0JBhoWgtVVQ84uj6FsEKFqS9P7f1-gjZWr4lAESIlAfqqBnxkEgcacBVFaL0Wgb2eaABaSEXoejhmQpCIGixDC6HQeoUMBJdCYgWI4Gw0gCFfyID-P+pCWhKBIjgMABBUiQFoe7QhxCDjMRYuxWgTC6KUFYS5F6nCebwLCtYZUaFYJCjNsqWczgpSRgLrCJEag5FEKUcTFR5A6zRAYuongL4iDqL9pjWWG49GKJIYEwEShglaTCWACJiN1FdyIA5OOMDSrsKcLOTE1gRRjgGMIwMDjZywmNohT0mJDB+IUfo-+KizSEUVvsOk1QsCkHoZQHKbJ2QmONL1GIFj+4gnYSzASEoWoeALsYOUKh0FCIcIoREngZL+mWEvGkRoenxESAZEsgd37JCOWAE5UBcn5KcoU+a455TQnkNfNwXRBjomgozHowxOgfKER4RwS91IphGkAkBYDRkQJusaaZOsAKrA8toH6gKPmaGqRMYYwFnDIScN41wsi37rjUjhGsFkCbWWQOLE8Z5pZXjiRSsyVKQk0t0sgB5scnlsJet4TEMwllCNcFbWwAV9BKEWOKgwywkTol0K0xJhNlEpLSfWDJWSom1wlqeKWF4ZZByUAk9parRCpI5VALVkSckVDst3JF-5inQh6NVTwiJr5WynFYBB0q1RhjEp0Quqw-DKW6jSeAbQg4FP5bM6wLNbESIJL0FmUo-qBk4asJQ9S8QszcDzFpZLsbPC0vsWNliQRVRmIqTQbhykDjNlbHNGgRRoWWboCR4LKWQArTMmQchAYsx+joLFjaal6FUIiLEnRbBdELvIbtbL9QEENGAPtyKWpqlUE4YY8xC6uB9QBcc8CxLbS+VMCUS6YoPitc+V8G7-xbvlEbEdqz2Y2GggiZQwZ5wDHZmFeci7i1ywhfqChisSKwDIumR9pUqrAQTZoZwSFvASi-V0BwmJOgs3plbYDGxyXYWXamNIh5RDGmQIINJgg4PzSlAYN1apwKgQOhJKwjhphIifiuLEioIYgY3GB29ZarJcroy9D5iahgrPFK89ZgZAJ1OvpCCp7Nr6dGvfeJQcVogJSSildKqAJP9iBsBRcMJIz1NmBmySP1pXzE6BIxCVtIxLzOugfqQ0IAmcQGGDyDNZirC9BnCeExBjyhXJ0IYBgkItUQkvBW5cOmWL7si+EWHkKKQVbMBTExO3dAMIXMMaIFj9CXq3N2Hsq4118zBQY4JxxIhajCYMBd6ruFDLBYcoF84yVJYRktlXtJrwIBvGGdXB72CBoiPOywugfJcRoHN9adCjgREDJdTEYavkoMcOriEf0fIGCuY7cWlsvvrcOVN-mBsqSIx-eRKqUv9zS866w6Ik32NTU42zqIliW0cx8tqzhxwEfuyW01ASVYWog9EahtC6vWIGDwoGEj2ruCcP9TreI5XDkVGs5VZrkkWrURorREAdHID0eWvllbEDI-sGKLE-EH7QXw6oTtabUPjljIJrUUOkkw6IJa9J4TbXrrp-2hAczHCW1-WGVOnhPQuMUBCAY3hPTLERBFfnTxBeqpJyLrplDen9KRyhOcMl81aHZooL92bYJYn6F4V54PjUG5eyLvRkBaePTjQzr00x1C28UFbeYu0tpohmNCOQDWVm4kOWAY55dJs-WAgiQVUlVinYCpCS2qxnDDgUCMa+WmNKBFpZR6jGZaNS+RY5iqoLRJyH0IXAKoFhULad1faEvi9ePf8ULshuBMkS+rzRpH458WJzY76UCZsfkzDCo-fNoFythqAA */
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
            onDone: "idle",
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
              target: "JoinedOrg",
              description: `Aqui recebo as informações da organização que acabei de entrar`
            }
          }
        },

        JoinedOrg: {},
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
  },
  services: {
    sendOrg: () => new Promise((_, reject) => reject()),
  },
});

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
