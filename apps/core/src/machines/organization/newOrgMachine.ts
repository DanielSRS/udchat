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

export const newOrgMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDswHcDyAnKBZAhgMYAWAlqgMQDKAogCoD6AqrQEoDaADALqKgAOAe1ikALqUHI+IAB6IAnADYATADplAVmWdOAdgAsADkNGDAGhABPRAEZ9nRasMO9+pTZu7DAX28XUmDgEJORgqoI4GMh0xGBUohH4MBQQkmGwoviiYQHYeERkqOGR0bHxiTBcvEggQiLiktJyCJ42nKq68gDMnPpd8vrK8sr6FtYIXYZqPXYa8roO+roqvv7oecGFYRFQUTFxCVhJYQBm5BDkuzgpaarkAG6CANY560EFocW7pQcVp+eXPIIB6CQhZCTIKpVaR1MQQpqIZa6VQ9eRaTwaOyDLpjWweVTyQw2DS6XTaJGzVYgXLvEJFHZ7MqHY6qM7IC7IK5QChgLBYCKqfgAGyyJwiAFtVDT8nTtiV9uUjjBWQDOUCQWCGpCeNCarCtQiWp5VBoNIs9DZ5JxLfpRlZEF1lI55G1FroNIpuraNFTpZtPgyfoqWRAwEKwOI1ddUkUQS8pW8ZVsvozfkqwqHw5GucDkI9NRCoTwYcI4Y0as0NF1kYTlCZlMTDPNdDj7QhNPoUT0W5wm5x+op3b7E-76fKmX9VJmI4Drrz+VhBSLRGKsJK-R8x98FczldPs+q86DwZIi9UBKWDRXEFXDKpFBollW60MG3bxj0NKodI60VXOCS8jDoESYBuOaYssggh5AAYoIACu7IUAAwqwNAAIJ0DQDAYKwADiuoXvU8LXkaagPvIlHEg+NhEgMuIICSX4qM4RJEtRXRdMBGybnK24TumUrQTgcGIRAFAAFIYAAkgAcjh+GEbUl4kaAzQALScWoujEraijmooRgMfoKhOCS1rKA2miYkBfjUiOvEpkGu5hIQWBgOCUZQPgyCkAAXieyA3LGR7xhuspOTuk5uR5B44D5-mBbm+aBWeJbEeWamIIZ7QLMM8ycC6igPsoDFkneAEOKag5tNWNjcbSyaBlFgkxZ5XIJQFWo8nyArCqKEoJiBo58amwbKm1cXeb5XUQslx5amleoqZlsi2L2qjEpRlE1WSCw2AxTZdN+Sj6I+pr6DYIz1XZ4VNeB43pPg9yzlAdCCI9wVhHGrzDY5zUCSysDPa972PfNBanjqxbLRlUikTYXSmYMJlDHYigeH0xmUZtIyGB6mIqDligNaBW5jS5qjAy9Xlgy5PULkuA1rkNPERQDEHKtToMfS5EOpdD57KXDhqI4ox2FQ+XQaE2hLVooh02M6tGdAsBh1lopMjZFgNcyDXkwfgpBCvB7kUGhdCsAAmkp+qqWtLQOORtGOsVfROvMDGul+nBDNtgzFQs+ha45EmCOQ6HIBg02Jd1MbpJk2Ss41nxhxHUcx7NUNC3bq0aYoRKbToyheIjhWFYYXtowSxgesMxXDLRIcRWnyCR9HnWBSh6GychNAADL9wpeEMFJcm2yt8NZQgmlzCdSsOEjrT4wxVY2OoD50T0BdTMozfJq37eZ4FqhoEb2ZwVg0l5mIYCSTJ8m4SPckAGrSVhE8i6R6meIXziTP2B8Kgrq6AYpxeQJp3TFwMKaU6+9U7hzbhnTuWpVCsDAIQMApB7iQGvi9bI71W55AoOhZCfcAAKjBX7vxoJ-MsU8HY-1JHeTo+l+yPk0JxSubZ9odD6JRIkyw0S9HgUUQ+yCZonyoGAdklx0KYP4JkZAmCvp3FCr9NmB9EFHxQRCVQ0jZGcnkWARRPlMH80WoLdK9DDTqSmOvWu7oWyWSfAdNsbQ3CbXsWaQw+kco+Fug5Fu2iJGxz0QAdXPq9AAIlkfA985I0GicPBgckYIYDoVeaedimzqGrF0K6V1DDuktAxYq7RbRb18SSSYJNAl-WCenDukjUGKkuLJRMqifrJzJmEcRzSwmSH0YcdpiYLGFisbDGx38iTtCRsoT8hIqw6VbB+X235xZdFtHoSySMAlrAaVoppx9WkjM5B0kCDM+rLlXOuIJRykEDKzsgYZERRkgXGdnTJ9sNJXX7CaEuC8CkqDcArNsZ1kQeBJGSNETo5g+nqZosCUB+6CHwKGcS0SB70Gwk-b5edbAF2OmvAYm8VDaFWYgOs68dBnV8fYUkXhbIHKRVuVF6LICqFwGAcUAAjXksA7gQHDBQWSNBwkMFwDQXAAAhGgHAYZEWmdPckd4lCDk9AsasehV52HvKaIOfRaWDlEXxdlGKuU8v5VgQV6KORQAudyvlvISHROSVK2V8r8UMOaNoZw95al1gxsUj0ZUTJFxMIywySsnSmq+OazlTrrWCtgDI+1eCxBd3jmox4YV7nIoTRAS1zqbVUzTZcDNic5oagFtwb1hpNBXQJDRFsxViSPlAe4n8ThwFojcL4yie9EUpzZWii1SaBVlsMVAStXd5zXOZncw5Bax2JqtZO1N07Z1ak+dqOtirhbKodtoYqPb+gNitMC7h4wPAYxRFaTQ+NaL9mJHGnYhbi3JtPlEzk6DYBCGQKmig1CsIMFITQShST62kUdDpdQBgCmaGjdWMqnEnCzLrNWLwPQuLDt6fG1dRaJ2ls3favI18xRdPUT07W77COfo3eWryFHBC7qWkqrJDsei9A6OiApwwWyWjBR+MkuN6z12cABFsb6cAfuIympjXIWNXMXP1Fcg07oro5UR9dJHFPkeQGKNjkyOM-IdOepw7okbFX0kjboDFtDtGKcVN8ZIkblRkyi+j8nXlYEuEwfgEB8ARggMQ7N3TNOju0wx0tbTOQBaCyFw8KVLH7pzpPBt1dsOcQNZZSy16HQDDMmaXsZ1ewqARSykdZrvO6cFXFqACXguiFC3OXqqmbkafzVF8ddXfP+cC811rUBjNpesZx314svxXStNRBwLtO3jEJptaqaJlhHSmL4W6ghQzwBqJFsA42zMz1olMfVxTyRzG1YtxAP9DIdBdPjM6j5Bi9k8xTP4R2CUz0uuoYkOhCqPiJJ6YTVK1B+sRvwrwHoCm4aq-hjmj0VTTryF9n12UOgmG2r0TEhgeiDC9oVDovZIckjsMMas73nKTn3K9NHhpCQQJMpdWWTZ3RGTbEhk0OP8aLE8EoKnLVILCSgKJdk9OEa0RNDLFn-DLqmmMjLTa8zqXWm6Ps+yy7ybU9au5dqeRdGrVzujhAviCQel8VsyyegySlR4Vs78kw8eAXdCXZlmvWWjR1yyHYYuIAS+nojF0BJOhbMHNaXeXsljE6JPkp05JBe6yejTLkdNPtTImwoboKI3x6UsmXSlCADAQJLmSIpp0S51Ph7Rh6lMdjIT11qGgfIA8OzaBA4pxSTJMSWDpO3N7+zaTx20OwzhLS+MT5zZPr1DbG1NodjPx3EZ4+-Czq6Jl64y0JwBb8ftKIB3D7oON-STn22N7Yl2nZN5kj0FdtWDnkSeit0oPtIxBhH7w9rE-huXlnzhJyS+StBfUzb7JhM3a-S7boe-dxOeJ-QYYYYpfsX2Y-EJJ5E+dBTBbBXBG+AhQQIhHAVvX5UkY6LED0OwToW-DQVeZYB7ZYKsMggcD-avUOVA0-IZAxe1YxUxZRYAw9TPE7Yg+8UkQpWqPaQ6YPboWFdES3K6FA45H-VQSJf-LkWJTIQg27LvE0ftXof+U0FeNsC7SzQyGWAYJWOWOQx5Ngl5BrC5VHRfUAqYY6YpToIwS0X2QyArBAewTsN8LvfnOwJ0Jgj3arVQb-FpPRGwxMZvBcdQgQ8AmWG-d0KAnVdxWYLxBsHxPxewDXA7UI1ghQ1uSAOwkAk3dSLwTsa0PQX8QObQKg9xIrW0LZSHBsXoXsII3IujbTWI2iHGX8OYU6fSfGfvKlTseWD0EydwwkB8TzOTOrbogYZEPonaCYoYr2fEZzGWM0c6ZYSnT-f6WTWrEtQVUgYVXg8-UiBsS0e8T0apFsToLQOoj8bPaWNwK0DGMWQyGYw4r9O1d5YjWIk9FhfocfdXFxR47KIwb8JWJGOqcWBDL46LHzUjCtHAwKeYtEHPNEZYwYrQcQ46NwSpIFB8QYBE3rI479ZQv9ADVNWI12O8bQUwx0G3XobfaYLZX2LZOPcWUktdckh4TNLUWSQQUQAxUQAEiuZtEkcWJsP2FIm9ApK-DwLZPvcWF9HknTck5E5jQzQQWkjWR3SYTGHaZ3MBT0YrHQUuEuA1dUmLerM5RrQbJLAg+wk3ePdoUwpYasIwF0QvOzc0vQIkK0kkG0nzBrJrbICAaIiIAE6Nb8BDKsMPfoTwz0abYuXoR9Xnd3Dog4xEvrHYFjIUkUmRMUl0w0azZEXvB8XobvBXeoiBMY9nXoLaTiLbbwIAA */
    id: 'newOrgMachine',
    predictableActionArguments: true,

    tsTypes: {} as import('./newOrgMachine.typegen').Typegen0,
    schema: {} as {
      events: Events;
      services: Services;
      context: Context;
    },

    states: {
      orgOnTheStorage: {
        states: {
          findingOrg: {
            invoke: {
              src: 'getOrg',

              onDone: {
                target: 'orgFound',
                actions: 'saveOrgToContext',
                description: 'Organização encontrada',
              },

              onError: 'noOrgFound',
            },

            description:
              'Verifica se o usuário já participa de uma organização',
          },

          deletingOrg: {
            invoke: {
              src: 'deleteOrg',
              onDone: 'findingOrg',
              onError: 'findingOrg',
            },
          },

          noOrgFound: {
            on: {
              CREATE_ORG: 'creatingOrganization',
              JOIN_ORG: '#newOrgMachine.JoinAnOganization',
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

          orgFound: {
            type: 'final',
          },
          savingOrgToStorage: {
            invoke: {
              src: 'saveOrgToStorage',
              onDone: 'orgFound',
              onError: 'savingOrgFailure',
            },
          },
          orgCreationErr: {},
          savingOrgFailure: {
            on: {
              RETRY: 'savingOrgToStorage',
            },
          },
        },

        initial: 'findingOrg',

        onDone: 'orgLoaded',
      },

      JoinAnOganization: {
        states: {
          waitingForInvite: {
            on: {
              JOIN_ORG_INVITE: {
                target: 'ReceivedInviteToJoinOrg',
                actions: 'saveInvitingMemberToContext',

                description: `Aqui chega o convite para entrar na organização.

O convite tem o nome de quem convidou e sua chave publica`,
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
            invoke: {
              src: 'sendInviteAcceptance',
              onDone: 'WaitingOrgData',
            },

            description:
              'Envia para quem convidou, a resposta de aceite do convite',
          },

          WaitingOrgData: {
            on: {
              JOINED_ORG_INFO: {
                target: 'StoringNewOrg',
                actions: 'saveNewOrgToContext',
                description:
                  'Aqui recebo as informações da organização que acabei de entrar',
              },
            },

            description: 'Aguarda o envio das informações da organização',
          },

          StoringNewOrg: {
            invoke: {
              src: 'saveOrgToStorage',
              onDone: 'JoinedOrg',
              onError: 'StoringNewOrgError',
            },
          },

          StoringNewOrgError: {},
          JoinedOrg: {
            type: 'final',
          },
        },

        initial: 'waitingForInvite',

        on: {
          CANCELL_ORG_JOIN: 'orgOnTheStorage.noOrgFound',
        },

        onDone: 'orgLoaded',
        description: 'Entra em uma organização criada por outro usuário',
      },

      orgLoaded: {
        states: {
          Members: {
            states: {
              idle: {
                on: {
                  NEW_MEMBER: 'addingNewMember',
                },
              },

              addingNewMember: {
                on: {
                  ADD_MEMBER: 'sendingInvitation',
                },
              },

              sendingInvitation: {
                invoke: {
                  src: 'sendInvitation',
                  onDone: 'waitingResponse',
                  onError: 'invitationNotSent',
                },

                entry: 'generateInvitationCode',
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
                invoke: {
                  src: 'sendOrg',
                  onDone: {
                    target: 'StoringUpdaetdOrg',
                    actions: 'saveUpdatedOrg',
                  },
                  onError: 'orgInfoNotSent',
                },

                description: 'Envia as informações da organização',
              },

              StoringUpdaetdOrg: {
                invoke: {
                  src: 'saveOrgToStorage',
                  onDone: 'idle',
                  onError: 'StoringUpdatedError',
                },
              },
              StoringUpdatedError: {},
              orgInfoNotSent: {},
            },

            initial: 'idle',
          },
        },

        initial: 'Members',

        on: {
          DELETE_ORG: 'orgOnTheStorage.deletingOrg',
        },
      },
    },

    initial: 'orgOnTheStorage',

    on: {
      SET_USER: {
        target: '#newOrgMachine',
        internal: true,
        actions: 'saveUserToContext',
      },
    },

    description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- A organização`,
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
