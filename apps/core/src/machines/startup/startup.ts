import { createMachine } from "xstate";
import { Organization } from "../../models/organization";

type Events = { type: 'CREATE_USER'; } | { type: 'CREATE_ORG'; }

type Services = { 
  getUser: { data: Promise<any> },
  getOrg: { data: Promise<Organization> }
 }

export const startupMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMBOKCuAHAsmgMYAWAlgHZgB0AZpRJVAKqxgYDEEA9ldZQDduAaxqpMOAsXJ96FRhRZsMCQdyJoUZXgG0ADAF19BxKFzdYZLb1MgAHogBMAVgCc1VwEYXegMyfPADYAdkdggBoQAE9ETz8PQJdPf09gz1cAFmSAX2zI8Sw8QlJKGjkFJXYOdgxuDGpcABtNWjqAW2oCyWKZMoYmVnZVCiENawpjY1tzS3HbBwRQ6kc9V18ADizHX0D13z0MyJiEXwzfak91vcC-fb1A9Nz89EKpEr4KbkGMADFubHkHAAwgAlACiAEEACpggD6zAAymCQVMkCAZlZtBR5k4vNQ9M5Ehl1gcMnpghsItFEGT3JdglcKek9Howk8QF0itJSnR+ooAPIYKBcXg0NSiTovbrc2R8qCCqDDUaaLGTQzTCyYmxohbBQJ05z+G7OdauPyuZxHWLxVyJZx6IJM1nOTzszlvXq8+RMBXVDC1epNFrtSUSLnvPregVCpXqFW6QyosyauY6mmudYXe0HYJminrFa+K0nM4XK47W4sh6uN1S8Oez4Kv4AiDA8HQuH8kEAcST6JTWJxCDNGWoZ0cpuJp1C+uLZPOvlcwQJ918jm2Zt8uTyIE+EDgtndPVKGtmg7TCHX1EpLsut68OyL1IQAFo4o5qOtvPaMhb1i6-EcWsww9HlygGZRTy1bEL2Xa91mCW9-wCB9AmLdJR0yXxEOwkI82CYDXmPWUo3lIUoNTUAFg2QJqDcfV10XIJnDCdDXA-PUXH2W1XCXNJCOlCNqE+b5m3kCjzyoxA0k-O1kmXXZfBSOc9EzDYgmwtI1wQs4BPrHkukgCTtSk4dHE8ZYHlZJSv0yAs2Mzdi9nJfVdlzHY9NAj5uCbf5xLRDFKPsRA3OoEJfHtRxdnuNxHBUj83FUh1WUCFjcO3bIgA */
  description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- O usuário (e suas chaves)
- A organização`,

  id: "startupMachine",

  schema: {} as {
    events: Events,
    services: Services,
  },

  states: {
    findingUser: {
      description: `Verifica se existe um usuário registrado`,

      invoke: {
        src: "getUser",
        onDone: {
          target: "findingOrg",
          description: `Se o usuário foi encontrado`
        },
        onError: "noUserFound"
      }
    },

    findingOrg: {
      description: `Verifica se o usuário já participa de uma organização`,

      invoke: {
        src: "getOrg",

        onDone: {
          target: "started",
          description: `Organização encontrada`
        },

        onError: "noOrgFound"
      }
    },

    noUserFound: {
      on: {
        CREATE_USER: "findingOrg"
      }
    },

    started: {},
    noOrgFound: {
      on: {
        CREATE_ORG: "started"
      }
    }
  },

  initial: "findingUser",
  predictableActionArguments: true,
});
