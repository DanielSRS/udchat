import { assign, createMachine, send } from 'xstate';
import { Organization } from '../../models/organization';
import { User } from '../../models/user/user';
import {
  ACCEPT_INVITE,
  APPROVED_INGRESS,
  INGRESS_REJECTED,
  INVITE_ACEPTED_EVENT,
  JOINED_ORG_INFO,
  JOIN_ORG_INVITE,
  NEW_INGRESS_VOTE,
} from '../../contexts/organization/orgEventTypes';
import { SendMessageResponseEvent } from '../../contexts/network/networkEventTypes';
import { CommitPool } from '../../models/commitPool';
import { CommitHistory } from '../../models/commitHistory';

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
  | NEW_INGRESS_VOTE
  | INGRESS_REJECTED
  | APPROVED_INGRESS
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
  newOrgPool: CommitPool;
  ingressOrgStatus: boolean;
};

export const newOrgMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDswHcDyAnKBZAhgMYAWAlqgMQDKAogCoD6AqrQEoDaADALqKgAOAe1ikALqUHI+IAB6IAnADYATADplAVmWdOAdgAsADkNGDAGhABPRAEZ9nRasMO9+pTZu7DAX28XUmDgEJORgqoI4GMh0xGBUohH4MBQQkmGwoviiYQHYeERkqOGR0bHxiTBcvEggQiLiktJyCJ42nKq68gDMnPpd8vrK8sr6FtYIXYZqPXYa8roO+roqvv7oecGFYRFQUTFxCVhJYQBm5BDkuzgpaarkAG6CANY560EFocW7pQcVp+eXPIIB6CQhZCTIKpVaR1MQQpqIZa6VQ9eRaTwaOyDLpjWweVTyQw2DS6XTaJGzVYgXLvEJFHZ7MqHY6qM7IC7IK5QChgLBYCKqfgAGyyJwiAFtVDT8nTtiV9uUjjBWQDOUCQWCGpCeNCarCtQiWp5VBoNIs9DZ5JxLfpRlZEF1lI55G1FroNIpuraNFTpZtPgyfoqWRAwEKwOI1ddUkUQS8pW8ZVsvozfkqwqHw5GucDkI9NRCoTwYcI4Y0as0NF1kYTlCZlMTDPNdDj7QhNPoUT0W5wm5x+op3b7E-76fKmX9VJmI4Drrz+VhBSLRGKsJK-R8x98FczldPs+q86DwZIi9UBKWDRXEFXDKpFBollW60MG3bxj0NKodI60VXOCS8jDoESYBuOaYssggh5AAYoIACu7IUAAwqwNAAIJ0DQDAYKwADiuoXvU8LXkaagPvIlHEg+NhEgMuIICSX4qM4RJEtRXRdMBGybnK24TumUrQTgcGIRAFAAFIYAAkgAcjh+GEbUl4kaAzQALScWoujEraijmooRgMfoKhOCS1rKA2miYkBfjUiOvEpkGu5hIQWBgOCUZQPgyCkAAXieyA3LGR7xhuspOTuk5uR5B44D5-mBbm+aBWeJbEeWamIIZ7QLMM8ycC6igPsoDFkneAEOKag5tNWNjcbSyaBlFgkxZ5XIJQFWo8nyArCqKEoJiBo58amwbKm1cXeb5XUQslx5amleoqZlsi2L2qjEpRlE1WSCw2AxTZdN+Sj6I+pr6DYIz1XZ4VNeB43pPg9yzlAdCCI9wVhHGrzDY5zUCSysDPa972PfNBanjqxbLRlUikTYXSmYMJlDHYigeH0xmUZtIyGB6mIqDligNaBW5jS5qjAy9Xlgy5PULkuA1rkNPERQDEHKtToMfS5EOpdD57KXDhqI4ox2FQ+XQaE2hLVooh02M6tGdAsBh1lopMjZFgNcyDXkwfgpBCvB7kUGhdCsAAmkp+qqWtLQOORtGOsVfROvMDGul+nBDNtgzFQs+ha45EmCOQ6HIBg02Jd1MbpJk2Ss41nxhxHUcx7NUNC3bq0aX0x2I-MIy9Docyml70udv2j4YyZegjFxt0ORFafIJH0edYFKHobJyE0AAMgPCl4QwUlybbK3w1lCCaXMJ1Kw4SOtPjDFVjY6gPnRPSKMYlkh634ftxnXdaqoaBG9mcFYNJeZiGAkkyfJuGj3JABq0lYZPIukepnhEk4fszgkYeisroBinF5AmndDoZQBhTSnQPsmNuHdM6BVUKwMAhAwCkHuJAW+L1sjvTbnkCg6FkL9wAAqMHfp-Gg38yzTwdn-Ukd5Oj6RroMKskwyrWg6H0SiRJlhol6Eg1OR9UGnwhKoKgYB2SXHQtg-gmRkDYK+ncUKv02bIIkSfGa6DZHyM5IosAyifLYP5otQW6VGGGhYQ4E0ZpCRkhlp6boXsZbIjOpaEwmISScSbmsP6h906d30WfAA6pfV6AARLI+BH5yRoDEkeDA5IwQwAwq8M91LGA3vMNohhByWS9ArNs6N2g9DgQHWsAFAn2WCTo0JaCz6KkuLJRM6ifrJzJmEFBejY7SLaZyDpIFLGFmsbDWxv9Ogbyro+JYdZ5iGAYk6TsRhOJXSbIZT8JNm6NPEc0qRkgZGHHaZ0+cfVlyrnXC3Jpx8wmDJOcMqAozDwpSsdwLJ9sNIeA9B0Uu4tLJkiMm2asUD8aYi8GXZQ4KxFFH6Y8rOyBVBRLhJyN+ghsiwAoHJPCaEqBUAYGhCSNBkJYRid8vOiA-79A3p6SyJkjCGEdMsL2fRHB2EKudEk4sWzwr6bopF6C0XZkxdiigskaARLSbJfFNBCUMDfhgL+MMiLTJyVdJ0m0VAOH0rvIpGhK7EicIYZYqMtBdEtLoAVqhEUtOkaKy44q4BkMoZQ1gGA37JNlfKwlVKmEaW6F+aqiNnBOi2vIBiAxjr4xZejOYg4ujB32dosCUAB6CHwKGcSMTB70Gwi-ANotd7HXXgMLeKhtCtnGHWDeOgzpFPsKSLwtkglpq3Jm7NkBVC4DAOKAARryWAdwIDhkldKhguAaC4AAEI0A4Gq4WGqHbkjvEoQcnoFjVj0GvOw95TRBz6A2wctqdhdpzb2-tQ6sAjuzRyV56A+2Dt5GQmJKTp1zoXcWhGlFOxXXmF6M0mgrVlS0JtJGDYFhE0xGenAF6e3PpvSO2AciH0ELEN3eOGjHhhTuemhDEAr0vtvVTNDlwMOJzmhqAWXyl250DYgTQV0CQ0RbMVYkj5wHlJ-E4SBaI3BFMosoODGas2XqQ8OsjRioCUe7pcxc-UVyDTugR8TiHr1SdQzJuTWpxnZx-TPbQxU+P9AbFaK1u8vZKzmVaTQ+NaL9mJKJwjxHkPn2iZyTBsAhDIFQ7i2SH8sIMHITQahyTDMO1ZRvapVrNCGURtx8YLZY1El9iy1hPR6mqc7epojknSPaYfXkW+YoumaJ6drc9eW3NafI15Urgh9PajoznKehoei9A6OiK1wwWyWjKR+MkuN6zDF3mXflqaU65e7flzThX6tckawzK5zNbkHJmxJ+bKHFsleQGKZrS11XZKi2Zpw7okbFX0kjdxbZtDtDNcVN8ZIkblRczVgrI6XlMH4BAfAEYICkOw90nLfFXOfdORES4P2-sA-eQtCZrWbEneaCUjeXgAmHsspZFZYKBhmTNL2M6vYVA+im70r44PtuQ6wND37-3RCA7nL1RT1yVP4c2xpkjX2zmchhwzpnUBDuTOOz8pj4svwAetB6BwLsks3iVptaqaJlhHSmL4W6ghQzwBqKD5HYvZ60SmAes15I5g7vl4bwc34PTURMG0M0jpRMUz+Pr6ls9LrqGJDoblRglZKFWWofsVq7DbOWNLbozvnKTjZMVnAbvGMIEcF4NwlFeiYhZb0UqPGoELCJMmkkdhhjVijy1EMYYZxeQT4aQkUCmW0UEfMR8uPa3-LNI2s0CX2Gl91jkYSUBRLsmrwjWijj7cmH6JdCubZG0QarWly0kwe+c1cu5dqeRjlMIY4aIpBIPRFOTZZPQZJs-JeTd+SYLLALujgW2hpHbRrR8EjsQfEBh8zyLvkzoybBzWimKf2wJYAFfPFsJ0ckZfR6KmfWLkOmV3KZFHBQboFEN8PSSyRGfsMqNwdQUkKybZQYZYCAymHYZCNfLUGgPkd-B2NoCFLwAwB8d0JYHSAAx2R0DoeNa0Iwa0QkPZdtabR-MvPWGmLkQ2Y2U2MASg5oMNCWS6IkEYBlLeL2Mub8P2P9J0X-G1cnbWe1TfCQmlF2TsLeMkPQc3NWVZDeYkDHUkS6YzdXTQ0OIVB1E5C+dFAfCISjcQ+Ag3FhXfQws3boUw8peeT0Q-YYM1fsX2W1bQ8JaRTBbBXBfBO+IhQQEhePTw93FhFsTab0OuToYwo1NsXlDoeYKWW3AcDQ3ginKIp5FFQxB9ExMxVRDw0XdIzwTIwcJgjwfsPaQ6F0AkfoLQdEA-K6SIhwzfVFTzLkOJTIXQ2eIpdoK0T0CpBsR3L2YBE0WFS-EyGzSPOwkJB5Rwmo3nR9ECGY3JACe8WsTEdGSiafIbZ0K0OYeNR0BtEYo5aI55I4t5HAcghcU4zGKBATBwZwK6c1GtG8HoVQM6DdDGFsZwGWV4-YsYtuSAPIU45YL8XxK6R0WuQYFvWwKsE0LlasJsFtLjBEyRd4lFJ1DFLFOAP45NAEhlK0VPRGWFazWFSEiwq6W0Hkl0ckgZZFVQW+KAdyWAWATBAAKywWyDfzSMTz-jgXmKsl1RjRvw8Wt2x1tBbQfFNB8F2PujE1mxmIbzvAA2-2JxAwOju3aFhXDzRCtQWCzxTQqKq3gw+222NIrVxkAwL19nXms3R2lyxxjQAjJxdP+jdNm1q1I1IDHSaOXQQPbA8CgWKm4P8U6AGIgSQKrjTwxjFkMneyjIh3vXOTQAKxmJsI6DpVr0mEZXyPGEMgqiViRjqj5T6ELK2252k3Q0SMCk9LRGQLRB2nrnxmYKOkhIGD92uwfEGA7K53c2cOzG8181QxmNdjvG0AGFZOP16EUN9i7HsFhT6FAPFjnLmy7IeEwy1FkixUMVEArMKnXXoPFibD9l3XKStQMI8GTSYPFiczPOjJ2xkz2zFDXI1gv0mH+KUCvwgU9AJx0C8BBMPQAoh2+3pzh1SOaMTzAPmMuiWGrCMBdDBImDgshQQtkPdBJBQupzQr+xlJ+IiArIS2-AMGlk4hMn6DxKTwHNdG0C4WMCcWoq7J2EaxvNEDvLXMDkhNJAfF6BMlNHrNsBxnliYnsCn26Gyw5zBxq2QkEHFHFDEEoX5GwTFMuDXIKWwKMCMBfBT0tzaBrCugomM0GGGAAt0v0sMuMrgBEE5FHXDBmPsEtEspMCmCmFsq9gHM8UHGMHYkAj2V8CAA */
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
                target: 'WaitingVotes',
                actions: ['saveNewOrgToContext', 'createNewOrgPool'],
                description: `Aqui recebo as informações da organização que acabei de entrar.

São duas estruturas: Todoas as informações da organização + o novo commit que me adiciona na mesma.

Neste momento ainda não faço parte da organização, dado que minha entrada ainda deve ser confirmada com os outros membros`,
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

          WaitingVotes: {
            description: 'Aguardando os votos e a confirmação dos membros',

            on: {
              INGRESS_REJECTED: 'IngressRejected',

              NEW_INGRESS_VOTE: {
                target: 'WaitingVotes',
                actions: 'addVoteToThePool',
              },
              APPROVED_INGRESS: 'StoringNewOrg',
            },

            entry: 'checkIngressVotes',
          },

          IngressRejected: {},
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
                  ADD_MEMBER: {
                    target: 'sendingInvitation',
                    description:
                      'Aqui é informado o numero do ip do usuário que eu quero adicionar',
                  },
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

          CommitProcessing: {
            states: {
              idle: {},
            },

            initial: 'idle',
          },
        },

        on: {
          DELETE_ORG: 'orgOnTheStorage.deletingOrg',
        },

        type: 'parallel',
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
      saveNewOrgToContext: assign((_, event) => {
        const org = event.data.org;
        console.log('saveNewOrgToContext action', JSON.stringify(org, null, 2));
        const h = CommitHistory();
        const firstCommitId = org.commits.firstCommit;
        console.log('firstCommitId: ', firstCommitId);
        const commits = org.commits.commits;
        console.log('commits: ', JSON.stringify(commits, null, 2));
        const firstCommit = commits[firstCommitId];
        console.log('firstCommit: ', JSON.stringify(firstCommit, null, 2));
        h.addToHistory(firstCommit);
        Object.keys(commits)
          .filter(v => v !== firstCommitId)
          .map(k => {
            h.addToHistory(commits[k]);
          });
        const organization = Organization({
          commits: h,
          creationDate: event.data.org.creationDate,
          firstCommit: event.data.org.firstCommit,
          members: event.data.org.members,
        });
        if (organization._tag === 'Left') {
          return {};
        }
        return {
          organization: organization.right,
        };
      }),
      createNewOrgPool: assign((context, event) => {
        console.log(
          'createNewOrgPool action: ',
          JSON.stringify(context.organization, null, 2),
        );
        const voters = context.organization.members.map(m => m.username);
        const currentCommit =
          context.organization.commits.getLatest()?.data.commitId;
        const newPool = CommitPool(
          () => console.log('APPROVED_INGRESS'),
          () => console.log('REJECTED_INGRESS'),
          voters,
          currentCommit || 'erro',
        );
        newPool.addToPool(event.data.addedMemberCommit);

        // Então eu computo automaticamente o voto de quem criou o commit, dado que este
        // obviamente sempre será uma aprovação
        newPool.addVote({
          from: event.data.addedMemberCommit.data.from,
          in: {
            commitId: event.data.addedMemberCommit.data.commitId,
            previousCommit: event.data.addedMemberCommit.data.previousCommit,
          },
          vote: 'accepted',
        });
        return {
          newOrgPool: newPool,
        };
      }),
      addVoteToThePool: (context, event) => {
        //
        event.data;
        context.newOrgPool.addVote(event.data);
      },
      checkIngressVotes: send((context, event) => {
        console.log('checkIngressVotes');
        const commitId =
          event.type === 'NEW_INGRESS_VOTE'
            ? event.data.in.commitId
            : event.data.addedMemberCommit.data.commitId;

        console.log('checkIngressVotes commitId: ', commitId);
        const res = context.newOrgPool.checkVotes(commitId);

        // Not yet approved
        if (!res) {
          console.log('checkIngressVotes do noghing');
          // raise({ type: 'do noghing' });
          return { type: 'do noghing' };
        }

        if (res._tag === 'Left') {
          console.log('checkIngressVotes INGRESS_REJECTED');
          // raise('INGRESS_REJECTED');
          return { type: 'INGRESS_REJECTED' };
        }

        console.log('checkIngressVotes APPROVED_INGRESS');
        // raise('APPROVED_INGRESS');
        context.organization.commits.addToHistory(res.right.commit);
        context.organization.members.push(res.right.commit.data.newMember);
        return { type: 'APPROVED_INGRESS' };
        // update commit history
      }),
    },
  },
);

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
