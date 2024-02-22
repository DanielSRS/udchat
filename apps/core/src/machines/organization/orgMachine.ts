import { assign, createMachine } from 'xstate';
import { Organization } from '../../models/organization';
import { User } from '../../models/user/user';
import {
  ACCEPT_INVITE,
  INVITE_ACEPTED_EVENT,
  JOINED_ORG_INFO,
  JOIN_ORG_INVITE,
} from '../../contexts/organization/orgEventTypes';
import { SendMessageResponseEvent } from '../../contexts/network/networkEventTypes';

type Events =
  | { type: 'CREATE_ORG' }
  | { type: 'RETRY' }
  | { type: 'ADD_MEMBER'; data: { ip: string } }
  | { type: 'SET_USER'; data: { user: User } }
  | { type: 'JOIN_ORG_INVITE'; data: JOIN_ORG_INVITE['data'] }
  | { type: 'ACCEPT_INVITE'; data: ACCEPT_INVITE['data'] }
  | { type: 'JOIN_ORG' }
  | { type: 'JOINED_ORG_INFO'; data: JOINED_ORG_INFO['data'] }
  | { type: 'CANCELL_ORG_JOIN' }
  | { type: 'DELETE_ORG' }
  | { type: 'NEW_MEMBER' }
  | { type: 'INVITE_ACEPTED'; data: INVITE_ACEPTED_EVENT['data'] };

type Services = {
  getOrg: { data: { organization: Organization } };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
  sendInvitation: { data: unknown };
  sendInviteAcceptance: { data: unknown };
  sendOrg: {
    data: {
      type: 'sendOrg';
      data: {
        net: SendMessageResponseEvent;
        commit: JOINED_ORG_INFO;
      };
    };
  };
};

type Context = {
  organization: Organization;
  orgInvitationCode: number;
  user: User;
  /** Usuário que enviou uma solicitação de entrar em uma organização */
  invitingMember: JOIN_ORG_INVITE['data']['invitingMember'];
  ip: JOIN_ORG_INVITE['data']['ip'];
};

export const orgMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAYgGUBRAFQH0BVKgJQG0AGAXUVAAdlYCAFwLIi3EAA9EAJgCMAZlkA6ABwA2adICcbAOxs5AVlkAaEAE9EstQBY1Smyptbd8rWq2ebsgL4+zaJi4hCRKAGbEEMRQAPLopBCiYErEAG7IANbJgdj4xMkRRFFEsegIacg4WMKi7Bx14nwCNWJIklZsKvJKbGxqujZssi6u8maWCGpsSoa9Nt7yavJd0h5+Aei5IQWR0XFQpGCoqGhKPAA21WFoALZKOcH54bsl++VE6VUtdQ1tTUIiVqgKQIZwqJSyWZsGy6HSuFTSNhjCyIeQ2bqyFRdKbyeS9NTDdYgB55UKBAAyyCwEEgpAAIpRyTRKLQYkwAOK-Xj8AGicQghSGeyGRb6VZaPHSQzjGTyaSqdw6WQGGFsIVEknbe7oSnU2kAYQAggA5fWM8msjm0ABSMQAksauSB-i1+TJVrolNpZD6dPJdJpdDKEMNDA4tIYsTC4XKNZtHmSdVSaRAUhBzmRjZQAOq0DCUDAAIUorE4jR5rraIOkePBehUelmuJcNmlKIQ8iFSjUKncslhcm0LjjQVJ2STetTsDARWido+QmqgISSRSH0y49HWopycgSmns5K89Si5a70+S9qnCdLsBboQ0lh4N0QvUbi06PUbYmUe7hn-EqtkihieCOWxPDuk77jOxRQMep7LkcJyoGclyCNcqB3JqEETim0GHnBC6CJeRDnpUJE-GWfwVneVYyHYYZqnYiz9q2djBrIcjKI+uhqJGLgNi4WhgQmm66nhADuWAAiUTBwHwRDTqQDoAGp2tQLKGmaAAKGl0jeNF8nRHYDFoPSrLYnYqLIYLIhMIo2N2agEssGh2Lxwn+MS8ZjtqUDiXuB6wfs87XCuoQVFkfngYm-m7lOMF7OgoXIGRXyApRXDUc0tHAqigzgiBKiGLoui9gibjBo+8paCosKGHIGi1csIm+ZBeFBUlhFhUhpwXFctzRaJfkBQlBEhUQ1xpRR15UdyOVGXloI+oVNZ8aVbirDYVX6EoixaKsBjLEi6K6K1264Xu1KwcaYASRgYA3AARkcpCGnSdJ5gWxalll828kC7QPnijlsBKb49q2g7BgM9j9NINg1u4L4IoY504XFUHkIIaDRPQPAQNUkD7OFySRZuMVifFSjY7jJT44TgjE2UFTpVe9Rzc6hmA9WznCnYzmuDCAxVRGSi6DZDU4rWeg2OjsWjTTOOoHjBNExAJO9Sh-XoYN2EK9TtMq-TatMxrLPrmzRCZeWC08zItWOR4XSKHKszGGowbONxLiGN4YNTEs0jy8kRDIPsABiyAAK5FKQ+pMJQhoaZanKc7ei1A649i4hVxXGFC0jBpGnqtgo-YGF0nFy15+uh+H6BR7HECkLaDqpwZdv3oM0xLHVvb6NZNme+20ZetiTidkimIqCHSg4KgYBLq86BYEQBAAF4kaTa7pFFdfz4vy+lFAa+byR03fLNf1c13xnKlM3bI3KPZg1omIw8V3bSFiOhqhGLk54LyXsIFep915bxaIcY4fU0IYSwj5LUwDj77DPpAwEl8MrX1tgDe8vFpjzH0LxGWzgOJDG6AdAcb5ayElrogp4sAsAnjAdQZARssAwB3uTIavlGHMJPqw9hMBMHs07rg++6JuhuWsi+HsfFPBewUBCZwiIFDaAas1OefCuqCOVhwsgWtUIDUwjwrU2iWFsL0cI1mM0OY3wzvbEMPZS59HIdCPQRd2wfmUP+BQ3hHBg0xMHOhW4GFMK6hHaS5xo6L1IInagTAACaYjKxLRsrCHoAs1FqgDKVMhnEHCYmcMsLoBghhz2tMgYghoiCoIgdvI0ppzSpxtPaR06dub3h9NMaqkZITKnmL0LQwYlj2Hzl0fQtghQ1gqVUogNS6nnxaEoKSMkoBR1QPBJmrc2ktNUupSgKTcpAwALSQl2liEqr4pZ8W-IgPiygPClQUHKTw6TZnVNqavepyy5I4DAAQVIkAtlgFYZU4gJMtI6ToPsjSRzM4gjOZGewnRcSLDRYjP2ZCPAzB-sYH+AxcQ1w2KE0I4L5lfPAUswENNEolENP8ngxEiD-K4eufe9CyVzIWd86lohaUEQZWAJla9-kiOttg7K4ilonK6I5EYCI6oI2hEGLxOKEQ6FRh+AkfsPkUsWeg-l5A6VQCFSKllBiYHazgXrTlyRyU8qpYaogArYJmuZWKmxV87E4NSac2Ejliq1QGCKSEB07khhrJ6NE1hiEIwjPIPVjq0EkSUNmaSoCT50mqFgHZDpKCfTZOyWgDoI4xHhY42V7hxYflqp4V+cxi7-ifvodE1gpRWSTZSlNyyjbRFuhJEmiQIrsopsNB13afk0r7SUAdbwvVYJ9VKv1iLrLCgRiBOQbhlRSmDCc7QvdFC3IanKfEXaDWppnVAOd8RDE63gaYp4E6L29uVv2u687La2IrfeE5bhnyrHKv+zQxUOIwh6NCRQ-5s5LEhHPGkGZM1DtXNwg+CGwBIYtheb1P7jIfnlJBgM-60SQeDC-HowxUUvg8o4IByAbg3CENpZAyBzhKCwKszN2kwBHFgHJWACklJFtoPqGIGAMDqVoOQagydGAiYABImnZIcjpd8lqRmsqoHimIJbOVIe2DQjz8ElW8MQxNITKZKAHfqejjHBCwDTBmUgWZcyifE5Jw0TAmB2hUgW3D6m1T2A-GDYqUwkQ-zIwMBwWJnLtsxDoGZFnhrWds0IBz+o8BgBwBkO0EcbMMaEPli4BA4Bsr3mO3yKWCv2aUBlrLOW8upcEEV84JXYDiptsu45IIRQuBmIMfsCIhizEhGRnQ0WCSjL9pIueVW7Ppcy9l3L+W7Mtba9A5CRjdYmIPnNtLtXFsNZW4V+jxW4Adclf9FdiAYSdj2pxNwftlj+k8RMZYyhMRyhiyqqDfgvJhxpPANoddfXdcQGcnsBGXboqJVKba7YTnCyUOGxGzlg3vwGHPQowV0Cg4RaidQMxFSaG3XxR8HEDriw0CKAOnhnlz3apAPHjjNDDC9O-X0SIAzk-bMqT0Q2lQgeKR+Bnl1UwEHTGAZn94axqlUE4YY8wGquAjdoRychWx1X-VMCUovMYdRNVski0vjKy-lMQ30xhlhYvbAiZQnZoOOBLv+czJLLOM9TJx6I-HBNS66-jjsX4IQeE0M4Pi3gJTBixN0bwDZezWGJ677ypKqZQTSAhUQxpkCCGNUQQQJulpSgMD0KYIodWDB-nZKwASehuGt7VXszs9eK06mAlKBegb+nfhRiMUsvARfbAjRypUjAimtwGTozfqbXXffdR6L1UAd+rHi5HaIYT9lhFPEe9kfR7UGXVfsIf+xT6goEFKWec8znz-7xxgzQYeEcJxCuDUqp+1xS7TiDYSrQjUCfvCV6GZ1Z9gl8HZdpjA9APxlgQM8lB9doJYoYhhtB9AX4-89wADTZmYoBKArUQCHwRg9oSknAJREQ+hVUJhbB7BBh35X53419gk3dhow5I4Y4ihcDnFuwVcDBX55FXsbti8QJOghguCT1eIgEj5MMnVjcb88FlhClkV8E0RZgVAYZXBzIpY5UFh+gtFwkLEhE-crswcQwCpkdBg5Q0QVcIwYZq0CRHx-x0RtBnJ6Dk9LNzET5IkCBolF5cDrBCcf4SCXlo9-QOJ21xZt1NU+4QM9d9RxDARsDF9pDjJeJ7d-QQ0JRSoydgiNBQiMcoR3AlVz1eVnVcCIc0QehoclhYcbcJgbJuwAkyopQlgSo6ozoktfJn1CjU0vcSgNkQVijIRbBVBYQf84RAMq9QQCQCCNA3YXkg5f9WitR2jJDfkssAUgUIAQUwU5lgCEiZV+jS5PA+gf4illDbcsRkcFA4QSoFAGwnCD5Fie1p0TV3VRV9Db5pVTkJQzJXBWJ-FNABIyFq05BoROIXxmIQICiliaV001l9hs1iJiisRwQoZ1B4ZK9TB2xYQPtbB1BvQFAAxZ55in1uVJ0+UXVcBhUPUwAL9c9r8DCA8TkJR7AgSYRrISoPARQOJ9pv5lh5gNURgk87jiSX1p031Z0P1ccdjTkERh9OhHAPxYQypcRIs6wri-CQJ1C0ZCSuVPlhSjVRTr1xSsCcDJTEUhQzI7chRS9ao1oqpZDEZSpgIlVegsR4MwBEMupvCfQwxpSvS0RVgQIxijBkctpfYLjSoAw6NqtmNWNcCSoXwKMnBHw+IPBLCvFzdD9JQJQBDNSGDfIcAmtoy2MOMM1ohuNeMfdRBpxYyKoEz7TkzPAI00Rnw5TSCQJvZVhZs7pjt7NcC7A6p7skYnsJleCQxoQegQIn8ypNUHJOyJJuyHMJcMxYykRpgoNSkoNOhQNB87sjB-RZh+hCEIxZz5yDt6tlsms1s4BeyIx5RrA+JUZIZewI19yHA0cDoXtbBD8-sfAgA */
    description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- A organização`,

    id: 'orgMachine',

    tsTypes: {} as import('./orgMachine.typegen').Typegen0,
    schema: {} as {
      events: Events;
      services: Services;
      context: Context;
    },

    states: {
      findingOrg: {
        description: 'Verifica se o usuário já participa de uma organização',

        invoke: {
          src: 'getOrg',

          onDone: {
            target: 'orgLoaded',
            description: 'Organização encontrada',
            actions: 'saveOrgToContext',
          },

          onError: 'noOrgFound',
        },
      },

      orgLoaded: {
        states: {
          idle: {
            on: {
              NEW_MEMBER: 'addingNewMember',
            },
          },

          sendingInvitation: {
            entry: 'generateInvitationCode',

            invoke: {
              src: 'sendInvitation',
              onDone: 'waitingResponse',
              onError: 'invitationNotSent',
            },

            description:
              'No convite de ingresso na organização, envio o meu nome de usuário e minha chave publica',
          },

          waitingResponse: {
            on: {
              INVITE_ACEPTED: {
                target: 'sendingOrgInfo',
                description:
                  'O aceite de um confvite tem o codigo do convite, o membro e sua chave publica',
              },
            },
          },

          invitationNotSent: {},

          sendingOrgInfo: {
            description: 'Envia as informações da organização',

            invoke: {
              src: 'sendOrg',
              onDone: {
                target: 'StoringUpdatedOrg',
                actions: 'saveUpdatedOrg',
              },
              onError: 'orgInfoNotSent',
            },
          },

          addingNewMember: {
            on: {
              ADD_MEMBER: 'sendingInvitation',
            },
          },

          orgInfoNotSent: {},

          StoringUpdatedOrg: {
            invoke: {
              src: 'saveOrgToStorage',
              onDone: 'idle',
              onError: 'StoringUpdatedOrgError',
            },
          },

          StoringUpdatedOrgError: {},
        },

        initial: 'idle',

        on: {
          DELETE_ORG: 'deletingOrg',
          CANCELL_ORG_JOIN: '.idle',
        },
      },

      noOrgFound: {
        on: {
          CREATE_ORG: 'creatingOrganization',
          JOIN_ORG: 'JoinAnOrganization',
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
          onDone: 'orgLoaded',
          onError: 'savingOrgFailure',
        },
      },

      savingOrgFailure: {
        on: {
          RETRY: 'savingOrgToStorage',
        },
      },

      orgCreationErr: {},

      JoinAnOrganization: {
        states: {
          waitingForInvite: {
            on: {
              JOIN_ORG_INVITE: {
                target: 'ReceivedInviteToJoinOrg',

                description: `Aqui chega o convite para entrar na organização.

O convite tem o nome de quem convidou e sua chave publica`,

                actions: 'saveInvitingMemberToContext',
              },
            },

            description:
              'Aguardando o recebimento de um convite para entrar numa organização',
          },

          ReceivedInviteToJoinOrg: {
            on: {
              ACCEPT_INVITE: {
                target: 'SendingAceptance',
                description:
                  'Aqui deve ser fornecido o codigo de acite ao grupo',
              },
            },
          },

          SendingAceptance: {
            description:
              'Envia para quem convidou, a resposta de aceite do convite',

            invoke: {
              src: 'sendInviteAcceptance',
              onDone: 'WaitingOrgData',
              onError: 'aceptanceNotSent',
            },
          },

          WaitingOrgData: {
            description: 'Aguarda o envio das informações da organização',

            on: {
              JOINED_ORG_INFO: {
                target: 'StoringNewOrg',
                description:
                  'Aqui recebo as informações da organização que acabei de entrar',
                actions: 'saveNewOrgToContext',
              },
            },
          },

          aceptanceNotSent: {},

          StoringNewOrg: {
            invoke: {
              src: 'saveOrgToStorage',
              onDone: '#orgMachine.orgLoaded',
              onError: 'StoringNewOrgError',
            },
          },

          StoringNewOrgError: {},
        },

        initial: 'waitingForInvite',
        description: 'Entra em uma organização criada por outro usuário',

        on: {
          CANCELL_ORG_JOIN: 'noOrgFound',
        },
      },

      deletingOrg: {
        invoke: {
          src: 'deleteOrg',
          onDone: 'findingOrg',
        },
      },

      //     commitPool: {
      //       states: {
      //         awaitingPeersResponse: {
      //           description: `Aguarda o parecer dos outros membros da organização para atualizar o estado de um commit. A medida que os pareceres vão chegando, o estado de um commit vai sendo atualizado até ter informações suficientes para aprovar ou descartar`,

      //           on: {
      //             ORG_COMMIT_STATUS_CHANGE: {
      //               target: "awaitingPeersResponse",
      //               internal: true,
      //               description: `Processa a alteração de status de um commit. Se aprovado, discarta os commits pendentes que não são mais relevantes`,
      //               actions: "updatePendingOrgCommit"
      //             }
      //           }
      //         }
      //       },

      //       initial: "awaitingPeersResponse",

      //       description: `Todos os commits que chegam para serem inseridos no historico de commits da organização são inicialmente colocados numa lista de commits pendentes.

      // Pendentes pois todos os commits precisam de um numero minimo de aprovação de outros membros, então um novo commit é inserido na organização apenas quando está acordado. Sendo assim ele permanece como pendente até que seja aprovado ou rejeitado.`
      //     },

      //     NewCommits: {
      //       description: `Processa a chegada de novos commits`,

      //       states: {
      //         idle: {
      //           description: `Nenhuma novo commit sendo processado`,

      //           on: {
      //             NEW_COMMIT_ARRIVED: {
      //               target: "CheckIFCommitComplies",
      //               description: `Quando um novo commit chega`
      //             }
      //           }
      //         },

      //         CheckIFCommitComplies: {
      //           description: `Verifica se o novo commit referencia o commit mais recente.

      // Se sim, informa os outros membros que concorda. do contrario informa que discorda.

      // Ao fim, põe na lista de pendentes.

      // ??? Add na lista de pending e envia um evendo de commit status change?`,

      //           invoke: {
      //             src: "notifyOrgPeersOfCommit",
      //             onDone: "idle",
      //             onError: "idle"
      //           }
      //         }
      //       },

      //       initial: "idle"
      //     }
    },

    initial: 'findingOrg',
    predictableActionArguments: true,

    on: {
      SET_USER: {
        target: '#orgMachine',
        internal: true,
        actions: 'saveUserToContext',
      },
    },
  },
  {
    actions: {
      saveOrgToContext: assign((_, event) => event.data),
      saveUserToContext: assign((_, event) => event.data),
      generateInvitationCode: assign(() => ({
        orgInvitationCode: generateRandomInteger(100, 999),
      })),
      saveInvitingMemberToContext: assign((_, event) => event.data),
      saveUpdatedOrg: assign((_, event) => ({
        organization: event.data.data.commit.data.org,
      })),
      saveNewOrgToContext: assign((_, event) => ({
        organization: event.data.org,
      })),
    },
  },
);

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
