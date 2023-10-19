import { createMachine } from "xstate";

type Events = { type: 'CREATE_USER'; }

export const startupMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMBOKCuAHAsmgMYAWAlgHZgB0AZpRJVAKqxgYDEEA9ldZQDduAaxqpMOAsXJ96FRhRZsMCQdyJoUZXgG0ADAF19BxKFzdYZLb1MgAHogBMAVgCc1VwEYXegMyfPADYAdkdggBoQAE9ETz8PQJdPf09gz1cAFmSAX2zI8Sw8QlJKGjkFJXYOdgxuDGpcABtNWjqAW2oCyWKZMoYmVnZVCiENawpjY1tzS3HbBwRQ6kc9V18ADizHX0D13z0MyJiEXwzfak91vcC-fb1A9Nz89EKpEr4KbkGMADFubHkHAAwgAlACiAEEACpggD6zAAymCQVMkCAZlZtBR5k4vNQ9M5Ehl1gcMnpghsItFEGT3JdglcKek9Howrk8iBPhA4LYukVpKVphZMTY0QtHI5qJTnAF1jL0slAr4jogALRxSXrbwZNYyjJZdaBVxPEB8t69Oj9RTfIWzLE4xZ6KXrYLyuUBLw7FUIdIZDxnV2+YIhVzk4Ims09UqW+RMADyGCgtpF2LFiA2gWobiNEt8XkCzjC3vSkuDLn2riNrmCaQjL26Ao+X2UfwBEGTczTi081ENSSD9z2KW9ZPWzqCQbSvkcLrO7OyQA */
  description: `Recupera as informações básicas para inicio do app:

As informações básicas são:
- O usuário (e suas chaves)
- A organização`,

  id: "startupMachine",

  schema: {} as {
    events: Events,
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
      description: `Verifica se o usuário já participa de uma organização`
    },

    noUserFound: {
      on: {
        CREATE_USER: "findingOrg"
      }
    }
  },

  initial: "findingUser",
  predictableActionArguments: true,
});
