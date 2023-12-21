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
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgpAAIpRyTRKLQYkwAOK-Xj8AGicQghSGeyGRb6VZaPHSQzjGTyaSqdw6WQGGFsIVEknbe7oSnU2kAYQAggA5fWM8msjm0ABSMQAksauSB-i1+TJVrolNpZD6dPJdJpdDKEMNDA4tIYsTC4XKNZtHmSdVSaRAUhBzmRjZQAOq0DCUDAAIUorE4jR5rraIOkePBehUelmuJcNmlKIQ8iFSjUKncslhcm0LjjQVJ2STetTsDARWido+QmqgISSRSH0y49HWopycgSmns5K89Si5a70+S9qnCdLsBboQ0lh4N0QvUbi06PUbYmUe7hn-EqtkihieCOWxPDuk77jOxRQMep7LkcJyoGclyCNcqB3JqEETim0GHnBC6CJeRDnpUJE-GWfwVneVYyHYYZqnYiz9q2djBrIcjKI+uhqJGLgNi4WhgQmm66nhADuWAAiUTBwHwRDTqQDoAGp2tQLKGmaAAKGl0jeNF8nRHYDFoPSrLYnYqLIYLIhMIo2N2agEssGh2Lxwn+MS8ZjtqUDiXuB6wfs87XCuoQVFkfngYm-m7lOMF7OgoXIGRXyApRXDUc0tHAqigzgiBKiGLoui9gibjBo+8paCosKGHIGi1csIm+ZBeFBUlhFhUhpwXFctzRaJfkBQlBEhUQ1xpRR15UdyOVGXloI+oVNZ8aVbirDYVX6EoixaKsBjLEi6K6K1264Xu1KwcaYASRgYA3AARkcpCGnSdJ5gWxalll828kC7QPnijlsBKb49q2g7BgM9j9NINg1u4L4IoY51PEQyD7AAYsgACuRSkPqTCUIaGmWpyc3OoZgMgq49i4hVxXGFC0jBpGnqtgo-YGF0nE2OjoSYzj+OE7aDoUwZC204ggzTEsdW9vo1k2WowbRl62JOJ2SKYiogvJDgqBgEurzoFgRAEAAXiR4XJJFm4xYbxum6UUAW9bJHTd8s1-dT0v3sqUzdsjco9mDWiYjDxXdtIWI6GqEYuQbShGybwhm+7ls2y0hzHH1aEYVhPlamnrv7B7OeAt7GW++WAfGbx0zzPovG1tCWgcUM3QHQOb61oSXnYaEsBYCemfUMg5CCGgWAwHba7pFFw-JKP49u5P0+zzANdXvUVO3otQM2biseOP2r58Z46sKBCziIgo2gNc1Kdr11m8z6gc9kL1KH9ehg0V77jHu-Ken9v67yIJleuANA49k5n0bu0I9Bs3bB+ZQ-4FDeEcGDTE0hX4gMztjaS5w8bG1ICTagTAACaUtYHGRsrCHodgXKIhKjxLunEHCYmcMsLoBghgp2tMgYghoiAV2zrbI0ppzQUxtPaR0B8aaB2VF6AMkZITKnmL0Tu7Ylj2GZl0fQtghQ1iESIogYiJGexaEoKSMkoC41QPBQQZBxbGjkapdSlA6GViWgAWkhLtLEJVXwNWcv+YMfFlAeFKgoOUnhGHmNEeI82kjbFyRwGAAgqRIAuLAJPYRxB9hvX1DpOgXiNK+NykDQJkZ7CdFxIsJpiNDDbXbEHMyDViqcTquiNEyTLGpKzjYwEShyCJRKIaLJPBiJECyQvB2Q1fJFKGdYquohxmTKgNMsAsyLZZMgdA7K9CAldEciMBEdUEbQiDGgjwqhtCdClB+AkbTBlWLSaMzZEyCK7P2fMn++c-6F0ASXJ4qzPkjI2UQLZfyZlzMORUdKe9qlHxBP42Ejliq1QGCKSEB1vxWBrJ6NE1g24IwjPID5wzK4kSUNmaSGc3Z0mqFgUg7jKCfTZOyWgDpsYxDRTLBA-jez2CxbVTw4c5js3-CHfQ6JrBSisinGkGZmUlMSBFdcy9wWhDVWADVZRkUzX3n7Q+wqPzymhP6JG5ybXBjDj0YYjSXweUcCndqe4t6oGiPQHgEBqiQE1auJZQCvWph9X6gNQaIBvBNT7M1MC-FAwssKFh-Q0SlXaRMJ+ShdA2XCUiduAxPWXUjZ-aNgbXFxviL-VCA1MLLIunFKCUaSj+urcG4164UVQLriclN1ZaqOQ8F0RQcpZjGDVu2Zw3EXBtOVO4PosYh56uSJC2l6SxntqgLdCSIbtVL0dsNTd6z6W7v3fG3tpqhX3lFdYGYCMQJyDcMqKUwZ-FPO7IoPi-4ayIj6DS89tjL13RKfW-+Rdm0QosVCuloHK0lCvT2i8ia73GX8W4Z8qxyrYc0MVDiMIeg2shCVRYSxIR+C8pjGk8A2gr2TTUjF1gEQ9HHc03ErSc2IH8TCT0lH+guoJLEgWa6txPEKMFdATH0WonUDMRUmg318UfBxA6+aNAijBh4EYvhxNOxGvFWTwrNDDC9JHX0SIAxqY6XoJQnh+LaBfIjbw+mNgSdiqNNMGYTP3hrGqVQThhjzAaq4IlD4PxekLXVbDUwJRltbR1bZLiSJ+eMgF+UbdfTGGWG04MCJlCdn-AMYqdV-zUoM8NCNdimXRDkrABS050tLVcmGawB1KV8W8BKArXRuENl7B1jwZiqttXLYvBCohjTIEEL8wQLXU2zGtVMEUbzBhxzslYHBPQ3B5dqmK2qiXvOdUzilRbIJ-SR2dRGcJXg45VXmPmgMZHGbsM6Md+KShrrRH3Q9Z6RwLvuhjoBGE-ZYQ6xnfZH0e1tF1X7CN-sn2oKBBSjNubM4FuDuY7LQYoMPDnzkPoBqVU2lPvHb0tUCq1Ap2FugXGBMIBA8mHVbs4WDDhyvqgiYG3FOdCGBzhq-oadjdLi7I10K0vY7kwgeE3D6lNzRLMFQMNXDmXCechY-QCHr32B-beYBmc2U6A5wYcos2dgjDDdw3ZOIvjaQk5y+DRdPDfkQkhZDDfS+Fax+wcdAPxKxLiO5EwfQaHzW+nQb4ERx0S-qcXgJKDHGZ7xIr-o8USlKqpjiSqI+RxfDo+BzuPOGbPV8mFzPAlLFBhxpYXGpQ8ZDIxG1nZVg2X7MMM6LvQhl8l7Y+xzKnH5Mr5CWwqhYTQg8CgnsW3QQEj2osADuXmmrGA+X+lmTsm5IgPkwpFj9gj6FJzTwfQ448JV+2LE4JI5uEbAW46xfvKeY3XBrd3zYW-Ngv8xFXv-pDt4xKGZK4KxNgpoAJF3DbnINCHbm0ksCBGvn3mMoyg4vsKysRJXlfg4N0s5DZnzNbsoNYI4E1D6LavrN3i-ikiBmMrgHsj-ujvNpXhKH7lomVEEh4CKBxPtLHMsPMAiJ4BtKqmAOql1Ebj6GGAiG5g5KsCBLPkYA5ltAugoCMAGMjnhLup2rGgft7v5i4NMMYHoB+MsARqVDtNMAWlDEMM5kiKvuQUZm2khlABoTWvsEnshMzs5qSnwk4BKIBv0FEnYA4LguHDfvMI-kAr3ghjug4ShlABgQjPmp0I4B+LCGVLiI6mVD0CVL0i8hrmjLYREduj8tEeBugK4WgJXkKGZIVkKKtrVGtFVMsA4DxMBNcr0FiNRj4EAA */
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
              target: "StoringUpdatedOrg",
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

        orgInfoNotSent: {},

        StoringUpdatedOrg: {
          invoke: {
            src: "saveOrgToStorage",
            onDone: "idle",
            onError: "StoringUpdatedOrgError"
          }
        },

        StoringUpdatedOrgError: {}
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
              target: "StoringNewOrg",
              description: `Aqui recebo as informações da organização que acabei de entrar`,
              actions: "saveNewOrgToContext"
            }
          }
        },

        aceptanceNotSent: {},

        StoringNewOrg: {
          invoke: {
            src: "saveOrgToStorage",
            onDone: "#orgMachine.orgLoaded",
            onError: "StoringNewOrgError"
          }
        },

        StoringNewOrgError: {}
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
