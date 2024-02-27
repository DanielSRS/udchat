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
  NEW_ORG_COMMIT,
  NEW_ORG_COMMIT_VOTE,
  SEND_MY_VOTE,
} from '../../contexts/organization/orgEventTypes';
import { SendMessageResponseEvent } from '../../contexts/network/networkEventTypes';
import { CommitPool } from '../../models/commitPool';
import { addCommiToHistory, getLatestCommit } from '../../models/commitHistory';

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
  | NEW_ORG_COMMIT
  | NEW_ORG_COMMIT_VOTE
  | SEND_MY_VOTE
  | { type: 'PERSIST_ORGANIZATION' }
  | { type: 'INVITE_ACEPTED'; data: INVITE_ACEPTED_EVENT['data'] };

type Services = {
  getOrg: { data: { organization: Organization } };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
  sendInvitation: { data: unknown };
  sendInviteAcceptance: { data: unknown };
  sendCommitToMembers: { data: unknown };
  sendMyCommitVoteToMembers: { data: NEW_ORG_COMMIT_VOTE };
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
  commitPool: CommitPool;
  ingressOrgStatus: boolean;
};

export const newOrgMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDswHcDyAnKBZAhgMYAWAlqgMQDKAogCoD6AqrQEoDaADALqKgAOAe1ikALqUHI+IAB6IAnPICMAOgAsADgDsAVm07OANgDMxgExaANCACeiM5x1qVWi-M7H5ew2uMBfP2tUTBwCEnIwFUEcDGQ6YjAqUWj8GAoISUjYUXxRSODsPCIyVCiYuISklJguXiQQIRFxSWk5BCUtJU4XeWNOX3k1M3kzNWs7BGMNMxU+pTUdeS0jNS1DMwCg9EKwksjoqFj4xOSsVMiAM3IIckOcdMyVcgA3QQBrfO3Q4oiyw4qTtVLtdboUEC9BIRchJkLVatJGmIYa1EGstLNOF4zB0dPMhsZxoglMSVPINEodFpXJw0fMdJsQAVvuFSgcjpVTucVFdkDdkHcoBQwFgsNEVPwADa5C7RAC2KiZRRZ+3KxyqZxg3JB-LBEKhzVhPHh9URBpR7Q6Kh0Bh8NKU7ntajGtkQ5kMpK6K10hl6TvpgUZXyVez+7MBGsiEDAErA4h19wypQhHwVQd2vzZAPVXKjMbjAvByFe+phcJ4COESJa9TaOmM6LJZg0QwpGiWWgJLoQZicsz6Hc4bY88kMugZivTrNVHKBKlzsdB92Foqw4qlohlWHlE5+U-+as5mvn+d1Rch0MkZbqAkrZpriDrGhUhicunM0xG80Jk0cKk4HmGa0+kpeRxzTXcVX3GcIwVQRCgAMUEABXXkKAAYVYGgAEE6BoBgMFYABxY0byaZF7wtGYX0UZQdBfJRyUGb9KR0Z8m0HBjiTo0wwJCYMM2ncMuWQOCcEQlCIAoAApDAAEkADl8KIkiGlvcjQDaABaUwZk6Jw1EMFYVg0b8DJmDRKU4JQzGxHtcVAgMd2VUMs0PSJCCwMBoXjKB8GQUgAC8L2QB4kzPFMnJDTMD1nDyvJPHA-MC4LC2LYKrwrMjqw0xB1mcYxPWmKYuhsnRvzxeR1GJEZ-2mCwlF4nYIJcmKYLi7yBSSoKDSFEUxUlaU5VTPjJ0gsNs01dqEt8-zuphVLzwNDKTTU7LZCJQcVCUQyPE4YYNEMe0pnK9ZWPta11kGDQrLURrmSiwSJqyfBnkXKA6EEJ7QsiZNPhG5rougrlYBet6PqehaS0vI1yxWrKpAopRjHWdRRku+ZDvmTsJjURQttGCz6PWW1DDu-i93GtyVBB16fPBtzepXNdBq3YamucwGhM1Gmwc+tzIfSmHr1U+HzSRkw-xHQ7+iRgrnQmbaey2rxcWtAziXrMnRpaoHudBnz4PwUgJSQzyKEwuhWAATRU011PWi0FhUA6R00VwyXcbGiXWYxnxV-brK0J1Scc8DnKkwRyCw5AMBm5KesTLIcjyNn7t+COo5juO5uh4W7bWrT6yfa61CRoOrPL+Ryo0CyrRL7Rtt6Tp-FD-7w8j5Bo9jrrgvQrD5LQmgABkh6UwiGBkhTbdWhGcoQbTFkl7ajGRjoGLKrs61UMwX0YvpDBrmyteajPO6znuDRUNAjfzRCsFkosxDAaS5MUgjx4UgA1WTcOn0WKM0h0ckzsPDXWRnRWyVguymEqixf8FgFiLB8Mfdumdu6zWCioVgYBCBgFIM8SAD9Xp5A+qfQoFAsJoUHgABUYF-H+NA-5Vlng7QBVInxaBHP+YwTgeymBMl2ZYqgg6eDJB0H0Bhbqt3ZiGU+Xds6YKoGAXktwsK4P4DkZAuDvpPHCn9GR6cO7yIvjCFQSiVH8jUWADRflcECyWkLTKzDzRsKMFaAwZJXDeEUF7doeh0QLHtM2VWHYeLSLTqUOR58MGXwAOo3zegAEVyPgF+CkaCJLHgwBS8EMBMLvHPTSNdVBLC6AdVwwxjAGXKgZbofQEE70bI4FuWw26yKMdE+Opj1S3HkkGHRv1U7k0iFE9BXTJBmNOL0oM9jSyOLhs4gBnDVA8IWE6VwbYtACImDvZwmhTDWTbD4YCIdWkGMiR0sZOdkCTOiNMvijN+rrk3NuMO7S0EKMvj0-kfS+KzNzvk+2WkuLumWGoFeNlXCaG-PWSqFlcRbP-DoMwsKUHvLPlczB8SkT8k-oIPIsAKAKUIphKgVAGCYSkjQNCuFEmAoLogQBnhVA+hsgZTQGhzBrBqcjLa4KvCILWPWFpgY2mGI+SYiZ2L8x4oJRQeSNBYlZLQhgXAuAf4ME-hgX+sNSKLMKdZHeW11hGEMgfA6G8FYFVYjXNYZlkUFSWGi8VGLPmmOlbcWVcAKHUOoawDAn8MnZPkiSmgZL6UsK0pslwu0DrcORWYb8vRVAMS8AVay4C2zOr3EPQQ+AoySUScPegeF34RrFgfX2W9Bi73WA4XxTZVD-gWAdcFVItkOTOREyCub82QBULgMAsoABGwpCVoX7oPEeWTJ7yXLRRJsyK-xUhMBZPaI4eHVybM+AqtoeEl2RtmnteaC0DqHaOrAsAngQBjPKxVDBcA0FwAAIRoBwXVIt9UOwcFs0khhRw+mWPWGkzF5jPmtGC3wzbRxHr+L209g6R1jpUPmvkUBfmIYvRQxJmTH0vrffOue9pBj4yWL6AwfClDfl0DMcW2JljE1xLBg48H+2YeQ7AZRaGiFiF7onXRrwIpvIElAVjEAz1IcvdTLjtwePJ3mnqQW3BCPfr9LMVYnQBycp7IYE6StzqqycJjTW4ThlwZPWx89HGZP8jk73ZcTyWavLFTmiz4n2NSc4xYqAdmDT-MNMpj9+dI32EHOiSpVILBNlLomrsiszoqwpEZ4kUiu1mZY25iTF6r3XxxVAbBsAhDIE40S+S39cIMEoTQWhGSVNtB4TSP8lkmw2SRUHGpe0-wHWZYBow21mM4DE1l6z3nCgPxlAMvRQztYZb7e5qznmbMCnG4Ifzy09UFIdly7oZIfDgtxp0BiunoHXXUJoZQXgg4ZoaqZmbg3MseavV5tDY3kATYc6uAaG4hqRRE0Nx70nRs4BW2t+ZG2gWukOuiDoQxSm+BMEYb8DhQW4wcPsqyl2tADdE5ltCghZSyjENQ0UuDYAiH5FfBJ-I71KvfgwFVaqf51cQC2boVk43kmGLVJHuJjUGQ7JoPaPDD23YBvdubKg8cE6JyTuA5OoCU7yzT5Vqr1WMC1TqvOM9zRDFHM+ayhqGJ2qgRMKk+UvCKAMGsdwpzRXnOPRLgH5i0O-Kl4T0QH0sISglI9ybgn9HdvM47hbV7nf3Ld2IT33vHug8C1r-+c8d5IxcGAgm+3piWtyrjK021PDYntJpm7aW7s4+D5J0PS3Xf4-d1Hn3IfHmfeeT94Trmy-ZbMZX9AEePeCC93X8vsfmeTFWS4M3lJg5rFHOVJFW1FjEh9AsGk-pi9i9L6ep6VB9YK++VAJg-AID4FjBAch-HBm-db+vtym-abb6mfyPfB+j+njSg4uPTjNu1kcHU9dGy5a+BhS+FaL0FLFUiMEMFjqLhzOLpfkCNfrcLclgLcA-ofqIMfkuH1I3k5tNqvkNhvlvggUgfvigWgVAIPkFtrhRLjP0H+GUu7KOBZN+KON0HoNoOCj4MoDwsvnboHrNjARGHARTqQDes-NQm+lQLJFQIwO-P3LJAAFo4SyQYBzrkEJ4OyrAopbQZrkigHwoAHOCYieAZ4sQWAirn4O58HnACG353L35EF5AQA0AYEUAyDZC5CRD4AXB5BYAAAUBgnAAAlBQGYUHhYTAFYQQbYQfvYY4SuEPnWCMDQb0CYKsIcr4uAkAZ4P+qAaME2NjkNrKvAUIberQPJLhlbJqtqowioV+rWP+pVOyl4LGkMPLJDqoKsEvp4iitiFwcEbwf2gURTmHvyLgDYF6n7u8AHultAf0fivAUMXgKMfimAGQfHjUblP0KxB2gZL0K1kjAAaxIsJ4G+HoBSBYLbr0dMeJgMdvktiMWMR9szN9qzBcWvjMfmB3t5ncUsSse-hDggCxJVGcZiBZB0FUowXriOE4MoCihrBYHkZltcSoIbMbJAODFxl8XkM4a4SnB4V4d4Z6AEUES3uYW8fAciTGBAGibyBiWAEPj4EapSFMH1pSNtJnpMIdOoMsEHN1kHGZAEI5IIFGPAPUGYb8QyvPAxNMOBtoD+ocVyd+IAoAZoEgq2jbsoBoNjpTECGKSFvPKXCoN0f+JiE4OSD6MdjsjMA4NoVdIsFZNiKltwVMVBFzMCEDlADqeaKCs2DRBsQxH0EMNPpVMsNoQsJ0KjiZivlAc6U9HONGAuD5B6RRB7OoD4Kmh7LoNCl2DplaBsWuqmZwuccSTrC6bBAhMhLyImURgxO4s2AxAMKXNaKZHoFtMjDZOSBjlMJqa5LFJ5B1IUJKiwsFuaAdKSHREsEYB+G4DUqsC2c2FSE4BSD4D0UWZzDGQcOJBWQsh-kSMyqSJwlUkwQxDZDUuiMGWXG6D+l2a1MDFvoUPTNqVuX8V0AVM7COJ0KONxEitOdDlMAsL+X1gZFebrJBGhL2QaDEZWQ7FxFtHtA4DdIoFsnsXFp0E+FUj-jXOCpiBAZGQ9NGVTDzAbEbCbJ5JBW0EjL0AaYsDvNaBZG4L4mvKheCj2P0NMF0CMLBqMm6mtEOQAn6c4LvNSLoE3CBlmaoLiOCn0IoKOD4iYBxZclxTcrlrfNEHJmAKRYykAu6AJbKcJSbkSIvD6FUsME2EBntHJRKjEqYtgrgvgoQo-CQoIGQjgOpRKVSL7HiHRPMJwkvmyZSKCksC+DwodJkdhY6drJxQOR8WhlYjYlompY+eKWwh2M+FSAbs+a4HpQgG2CUp4MisikdgVBsJAeisYpZVKlTgKMkjkC5UUoZKSEYMoLUoafRWAlaCilMM2IdIdL0OZa6pFTvr8oUDVddKxD6Bnilj6CrDCmsKSO4IsJykjHBQ6cERFWVTcgNUGDEdEDVSlpVAKhOXaXar4nWN0AsFLFDkyXoL1aVeMjcqfJAENQlbqZpGsDaoEl0UZkMNsvpVWvMB4B2u2q+NdZ0tcioB6rikscKeDolUjNQaAfEWwYZE6NPjORSOOQXpdqMMDZipfA-FAJ5GTtggAFY4L2E7UWA7a2QmqDD1jIrlR0ThZsoaavU0XwlzYuWppPjWRkZVIUZbxI6VTbQGT-opEjUdBs0IYh4c01qkb7mL6UblSWhBw1TWSBJm6dphU4EPYh7XoxguX56VR1EWodicJ5UwoUWrKKB9bizILFV-ba3l4oYQAu7oAeb60TkuDMoexTBspsk+BPhWQmAmDvn1i+AS2WaO3Payb2XBTS14w0gU01zAajixYKzgpPirq4j2iOAG7LkuYknzaO1KW3AFZFacYuXIy-gHzEaDg9h+l6a+wSLIpiIIKAV20X4R3t4vC8YGjyT4rmKiDu3KDPgHzsL2TATfXtAoXqZ7SSKsWYjh2F3t5R0+QrYV2LCbHEisE8IG7mmui-o4j87xH8JF6a1Rn-Y60HArZ92iAD0V3mBNoUh7QGQmmeBI6-ijAXbxH+L+2L2S7V4y6Qhy63AV1kisQ2RLCc5OgayK1aU+D-pDgeD7rLUrmXH-3S6iDE5ANk7wHF38guUSW+wQOIWjClxIUTAskp7virA2iDChUvEX2O3zFV4YO16Pb30WCkilyrDrCcqOCrDUacrOy+ALA+jz7mCmGoOvFL3IbkmomCB92IEXA2DsNPXmimB67mC+BIyfUHzlQOAlJHTmDDDzAoooP50hH9p4E34EMfmaEoohlgNsmGpsTrBdBOjxpVJ-3WOFHCEENeAcKDAAQdgBMtHdiYj4wmoHz9A0jQneNX74E77IHREYH+PbRcPdZVJHR02CL-pNYBO01OjIyFkWN9HiY+ODF3675EFP7OVqOUENxnZZEnEdAWCgZNqVrWhWSDiAZ-3XEuUQJtHsEGB9DNijD6Ns67T-hCrDC+B5326WNXGzGCF+P1NzxUW6TNziyL66Dv3ugUZSWjBCXKAlMLNlMqCInzE0kDNBysSDhxrP0azHU2R-iiJWRTAjOuB9PLMK5yOUmfTomLF5ADMjV-h7QdgUhMXIzficpc37KASVL-r+gBBAA */
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
            description: `Aguardando os votos e a confirmação dos membros;

raises APPROVED_INGRESS or INGRESS_REJECTED`,

            on: {
              INGRESS_REJECTED: 'IngressRejected',

              APPROVED_INGRESS: 'StoringNewOrg',
              NEW_ORG_COMMIT_VOTE: {
                target: 'WaitingVotes',
                actions: 'addVoteToThePool',
              },
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
                    target: 'SendingNewCommitToAllMembers',
                    actions: 'addToPoolAndVote',
                    description: 'raises NEW_ORG_COMMIT_VOTE event',
                  },
                  onError: 'orgInfoNotSent',
                },

                description: 'Envia as informações da organização',
              },

              orgInfoNotSent: {},

              SendingNewCommitToAllMembers: {
                invoke: {
                  src: 'sendCommitToMembers',
                  onDone: 'idle',
                  onError: 'FailedToNorifyMembers',
                },
              },

              FailedToNorifyMembers: {},
            },

            initial: 'idle',

            on: {
              CANCELL_ORG_JOIN: 'Members',
            },
          },

          CommitProcessing: {
            states: {
              waiting: {
                on: {
                  NEW_ORG_COMMIT: {
                    target: 'waiting',
                    internal: true,
                    actions: [
                      'addOrgCommitToPool',
                      'checkVotesInThePool',
                      'voteNewCommit',
                    ],
                    description: 'voteNewCommit raises the SEND_MY_VOTE event',
                  },

                  NEW_ORG_COMMIT_VOTE: {
                    target: 'waiting',
                    internal: true,
                    actions: [
                      'addOrgVoteToThePool',
                      'checkVotesInThePool',
                      'raiseSave',
                    ],
                  },
                },
              },
            },

            initial: 'waiting',
            entry: 'createPool',
          },

          StorageSaving: {
            states: {
              idle: {
                on: {
                  PERSIST_ORGANIZATION: 'StoringUpdaetdOrg',
                },
              },
              StoringUpdatedError: {
                after: {
                  '500': 'idle',
                },
              },
              StoringUpdaetdOrg: {
                invoke: {
                  src: 'saveOrgToStorage',
                  onDone: 'idle',
                  onError: 'StoringUpdatedError',
                },
              },
            },

            initial: 'idle',
          },

          Voting: {
            states: {
              idle: {
                on: {
                  SEND_MY_VOTE: 'SendingMyVote',
                },
              },

              SendingMyVote: {
                invoke: {
                  src: 'sendMyCommitVoteToMembers',
                  onDone: {
                    target: 'idle',
                    description: 'raises NEW_ORG_COMMIT_VOTE',
                    actions: 'sendVoteToMyself',
                  },
                  onError: 'FailedToSendMyVote',
                },
              },

              FailedToSendMyVote: {
                after: {
                  '1000': 'idle',
                },
              },
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
      addToPoolAndVote: send((context, event) => {
        const me = context.user.member.username;
        console.log('action: addToPoolAndVote :: ', me);
        // add new commit to the pool
        const addedMemberCommit = event.data.data.commit.data.addedMemberCommit;
        context.commitPool.addToPool(addedMemberCommit);
        // Add my own vote
        const vote: NEW_ORG_COMMIT_VOTE = {
          type: 'NEW_ORG_COMMIT_VOTE',
          data: {
            from: context.user.member.username,
            in: {
              commitId: addedMemberCommit.data.commitId,
              previousCommit: addedMemberCommit.data.previousCommit,
            },
            vote: 'accepted',
          },
        };
        context.commitPool.addVote(vote.data);
        console.log(
          `action: addToPoolAndVote :: ${me} -- ${
            (JSON.stringify(context.commitPool), null, 2)
          }`,
        );
        return vote;
      }),
      saveNewOrgToContext: assign((_, event) => {
        console.log('action: saveNewOrgToContext');
        return {
          organization: event.data.org,
        };
      }),
      createNewOrgPool: assign((context, event) => {
        const me = context.user.member.username;
        console.log('action: createNewOrgPool ::', me);
        // console.log(
        //   'createNewOrgPool action: ',
        //   JSON.stringify(context.organization, null, 2),
        // );
        const voters = context.organization.members.map(m => m.username);
        const currentCommit = getLatestCommit(context.organization.commits).data
          .commitId;
        const newPool = CommitPool(
          () => console.log('createNewOrgPool APPROVED_INGRESS'),
          () => console.log('createNewOrgPool REJECTED_INGRESS'),
          voters,
          currentCommit,
        );
        newPool.addToPool(event.data.addedMemberCommit);

        // Então eu computo automaticamente o voto de quem criou o commit, dado que este
        // obviamente sempre será uma aprovação
        // newPool.addVote({
        //   from: event.data.addedMemberCommit.data.from,
        //   in: {
        //     commitId: event.data.addedMemberCommit.data.commitId,
        //     previousCommit: event.data.addedMemberCommit.data.previousCommit,
        //   },
        //   vote: 'accepted',
        // });
        return {
          newOrgPool: newPool,
        };
      }),
      addVoteToThePool: (context, event) => {
        const me = context.user.member.username;
        console.log('action: addVoteToThePool :: ', me);
        context.newOrgPool.addVote(event.data);
        console.log(
          `action: addVoteToThePool :: ${me} -- ${
            (JSON.stringify(context.newOrgPool), null, 2)
          }`,
        );
      },
      checkIngressVotes: send((context, event) => {
        const org = context.organization;
        const me = context.user.member.username;
        console.log(
          `action: checkIngressVotes :: ${me} -- ${
            (JSON.stringify(context.newOrgPool), null, 2)
          }`,
        );
        console.log('action: checkIngressVotes ::', me);
        const commitId =
          event.type === 'NEW_ORG_COMMIT_VOTE'
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
        org.commits = addCommiToHistory(org.commits, res.right.commit);
        org.members.push(res.right.commit.data.newMember);
        return { type: 'APPROVED_INGRESS' };
        // update commit history
      }),
      createPool: assign(context => {
        console.log('action: createPool');
        if (context?.commitPool?.addToPool) {
          console.log('action: createPool - there is already one!');
          return {};
        }
        const org = context.organization;
        const voters = org.members.map(m => m.username);
        const currentCommitId = getLatestCommit(org.commits).data.commitId;
        const doNothing = () => {};
        const commitPool = CommitPool(
          doNothing,
          doNothing,
          voters,
          currentCommitId,
        );
        return {
          commitPool,
        };
      }),
      addOrgCommitToPool: (context, event) => {
        // context.commitPool.addToPool()
        console.log('action: addOrgCommitToPool');
        context.commitPool.addToPool(event.data);
      },
      addOrgVoteToThePool: (context, event) => {
        const me = context.user.member.username;
        console.log('action: addOrgVoteToThePool :: ', me);
        context.commitPool.addVote(event.data);
        console.log(
          `action: addOrgVoteToThePool :: ${me} -- ${
            (JSON.stringify(context.commitPool), null, 2)
          }`,
        );
      },
      checkVotesInThePool: (context, event) => {
        const me = context.user.member.username;
        console.log('action: checkVotesInThePool');
        const commitId =
          event.type === 'NEW_ORG_COMMIT_VOTE'
            ? event.data.in.commitId
            : event.data.data.commitId;

        console.log('[checkVotesInThePool] commitId:', commitId);
        const res = context.commitPool.checkVotes(commitId);
        console.log(
          `action: checkVotesInThePool :: ${me} -- ${
            (JSON.stringify(context.commitPool), null, 2)
          }`,
        );
        // start
        const org = context.organization;

        // Not yet approved
        if (!res) {
          console.log(
            '[checkVotesInThePool] - no pool entry with this id or no changes',
          );
          return;
        }

        if (res._tag === 'Left') {
          console.warn('[checkVotesInThePool] commit rejected');
          return;
        }

        console.log('[checkVotesInThePool] commit to be inserted');
        // raise('APPROVED_INGRESS');
        org.commits = addCommiToHistory(org.commits, res.right.commit);

        // se o commit for para add membros
        if (res.right.commit.type === 'ADD_MEMBER_TO_ORG_COMMIT') {
          org.members.push(res.right.commit.data.newMember);
          // altera o voters da pool !!!
          const newVoters = org.members.map(m => m.username);
          context.commitPool.updateVoters(newVoters);
        }
        // ed
      },
      raiseSave: send(() => {
        console.log('action: raiseSave');
        return { type: 'PERSIST_ORGANIZATION' };
      }),
      voteNewCommit: send((context, event) => {
        console.log('action: voteNewCommit');
        const commitId = event.data.data.commitId;
        const previousCommit = event.data.data.previousCommit;
        const newMember = event.data.data.newMember;
        const me = context.user.member.username;
        const sendMyVote: SEND_MY_VOTE = {
          type: 'SEND_MY_VOTE',
          data: {
            from: me,
            vote: 'accepted',
            in: {
              commitId,
              previousCommit,
            },
            extraMember: newMember,
          },
        };
        return sendMyVote;
      }),
      sendVoteToMyself: send((context, event) => {
        console.log('action: sendVoteToMyself');
        const vote: NEW_ORG_COMMIT_VOTE = {
          type: 'NEW_ORG_COMMIT_VOTE',
          data: event.data.data,
        };
        return vote;
      }),
    },
  },
);

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
