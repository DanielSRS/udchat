import { assign, createMachine } from "xstate";
import { Organization } from "../../models/organization";

type Events =
  | { type: 'CREATE_ORG'; }
  | { type: 'RETRY'; };

type Services = { 
  getOrg: { data: { organization: Organization } };
  saveOrgToStorage: { data: unknown };
  createOrg: { data: { organization: Organization } };
};

type Context = {
  organization: Organization,
};

export const orgMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHsBOUCyBDAxgCwEsA7MAOgDNiJioB5dAYgmRNOIDdkBrMtTXQq0pFqROugQdkOLABcCLANoAGALorViUAAdksAvJZaQAD0QBGZQA4AzKWXKAbAHYALMvMBOZ85s2ANCAAnoiOyqQArA6uruY2jja2AEyOngC+aYF82PjEZMKi4lAMYKioaKTaADZy5GgAtqTZAnkUVDT0UJJEnDKGRBoaxrr6-cZmCK6eVqTmUcquzp7KvlZJygHBiDauduZWtmF+Do5eGVnoOYJkRMidAGLIAK4iDADCAEoAogCCACpfAD6tA+AHEhkgQCMDAoiONEL5HKQ-GtEhEInMHElAiEEBErM5SK4MTZzM5lElbOYkq5ziBmrlWDhUGA5B10FgiAQAF5slhMFhkKQ8JqXFpMllssSdTk8vlEbq9eWDNTDPQwoyQiaWMKkVIuGwpKzKTyefY4hFWCJ6ylWZbKCKeCKnGx0hnXUjM1nyaUcrm8-olMoVaq1Bqi-iMsheqVFWUB2GK6TKtQQnTqsZahG6mLk5wJawLTwWhCWOKkTxJJaUhI2axnTL0sVR0iwLDsdlQP7IADKsjQWBgAtYwt4zY9bY7vq7vf7qEHYCTfVhKs0kOhmdA2t2dkcNKsZOdVkcjuLW0m5fMU3WcSSTrvtjd49ak873b7A6HpXKqEqNVkdSoI07ovu2b6zp+i5SMuSipqq64ZrC8Klo4BJEk4Hh1u4zjYuenixJEJKxK4xpmmsT6RhOYHTvcWAEFUTwsgw3x-B8ACaaZQohmpbhYiyePYriOC66wRDhPglmWSREvsUyJLYFIeBkja3BAcDGCBJBqqMSFZggKKRJ4qRJEkNhmieVYlgAtNSSJLMcqG+OYJ5WhRVytAUnbaRqcJ6YkSKOsZpnmRElnnl40n5kkER1kZpo+OYbnimOUAADLIFgakQN5m6mHxzjmMijorLY1b8SW6yEosGIGtEUzOklLa3A8zwiDlum8Qgjl6r4URGk4jq4bi7jScVxqWCkoU2PmjUejGPpxv68rtTxeUIKsMn4i4RzEtYJY+HYFKhahOyxPEzizaBU5FO+c4LitvmdVe1gVu4ho7L1Tr7UZerUs46K7HewlJJdrCvjRdEMSyD3Ic5x6kJS6yYfJfjOJJzmRWZXjWAkayUqDKVvJK-RfGUMN6fmhWo24jrTfmoXo3upC+Ga-0OEZBIg8pQA */
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

    orgLoaded: {},

    noOrgFound: {
      on: {
        CREATE_ORG: "creatingOrganization"
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

    orgCreationErr: {}
  },

  initial: "findingOrg",
  predictableActionArguments: true,
}, {
  actions: {
    saveOrgToContext: assign((_, event) => event.data),
  }
});
