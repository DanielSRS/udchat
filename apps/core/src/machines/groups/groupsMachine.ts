import { assign, createMachine } from "xstate";
import { Group } from "../../contexts/groups/groupsTypes";

type GroupsEvents =
  | { type: 'CREATE_GROUP'; data: { groupName: string } };

type GroupsContext = {
  /** Lista de ids dos grupos */
  groupsIndex: string[];
  groups: { [key: string]: Group };
}
type GroupsServices = {
  storeGroupToStorage: { data: unknown };
  createGroup: { data: { createdGroup: Group } };
  loadGroupsFromStorage: { data: {
    groupsIndex: string[];
    groups: { [key: string]: Group };
  }};
}


export const groupsMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5RQE4HsCuAHWBZAhgMYAWAlgHZgB0AMmvhBVAOLrawDEEalVFAbmgDW1VJhwESFanQZNW42AgFpC+AC6keAbQAMAXT37EoLGlilNPEyAAeiAIwB2AKxUALLoBMAZgc+nL11PAA4ANicAGhAAT0QAWhc3Ly8Qhy93Fx8g4NcwgF986LF2STJeWUZyFjYcDjAUdBQqLAAbDQAzNBQAWyoSiSJymXoqmsVlckE1K3IjIxszC1mbewR4lIcqPxc0sN0HMIddA6jYxCCt3fSQgE4Qp10w291bp0Li2rwh6VpRyAU7CogJwVAAyupumAAMIoMAaAG1Lg8agqET9L5lX6VRGKYFfcGQuGw+HqXHYSbTDRaOYGBZIEBLSw01aIB7uKj+Y7+MI+JJ+aJxBB+MJUFz+W4+O4+CJOELuApFEADb5SCr-CAg2D4vEQqEkhGapENJotdrqLq9DGKLHqhjk0Fawn6uGGkGU1TUnR0gyLczM6wMtYOdxpKhOTxvMIuFIxlyCxAuW5beWhFyZA5JdwfZWYn52iAO7VO0gQVpgDjQgBKAFEAIIAFRrAH1mFWAPIAVQACvTTP6VkHHIcvNsXLonHz9ilk-HzghUltbl5k14nMmXrpxy4cyrbSN7Ua8U6DZpqiDkbw0aI82qD4Wj0CT66z+MKSoZjT5r6GUzB6Bg2cNwwncTIHBcJxeSTCMEwQGMQk5YJMlcZd5V3W9hj+Q8nWfUl5GNRpujNTpuj6Pd83vIsdSBU98PED1P29Qwf37ZYWSHBAQ10BC7mOXZ3FueD7lg9xjg8fYgMnI4VwcQolXINBC3gBlyLvP02MDACEmyUcQwCNJ11uMIQJg+d4hDUUQh8dwnAcZwMiySD3iVVTMMqOj2HUgNyFZdYUl0DwnjXUSMjCLxxVgxIEMc8dQwgiMZRcRVPhtCisIfLUvP-OxECcOVOT8A4ZT5LIHEipNOWgiy0gcNJvHQ1K73SqjMt-Ad2K0hAQi8UUuSKqDStg1IxXAlck3HB4fFeZLc0atyNRwgk9WJF8HQAMXwUhywgLKOpyzjowCqToy8Q5TncWCwgeMVMnTIzauXVwGtKNKcUfR0lqJGFVve3bNP2uzRLFEJxSSiDQ0By7eSoQSQmCEUgiu7MXIw7EFoJEsyzAP6fI4uzJ22e5QJAh7dGyWC7N6l4pqCLIZX8EJnsGJqNq2yAGzQSo1vQHplvwGAcd8jYI05dx9OcW4jJMi75xlW5xJ8enwiut5ZJRua0ewjGCVo89akFvHDnl3xEekgS4tgqUOSSR5Hi3e5nGRlKXqat7FuPWoADk0HUU9IANzrDiusUV1eem5bnIVQlF5DQJeF54rk-IgA */
  id: 'groupsMachine',
  predictableActionArguments: true,

  tsTypes: {} as import("./groupsMachine.typegen").Typegen0,
  schema: {
    events: {} as GroupsEvents,
    context: {} as GroupsContext,
    services: {} as GroupsServices,
  },

  states: {
    LoadingGroups: {
      invoke: {
        src: "loadGroupsFromStorage",
        onDone: {
          target: "LoadedGroups",
          description: `Grupos recuperados do armazenamento`,
          actions: "saveGroupsToContext"
        },
        onError: "FailedToLoadFromStorage"
      },

      description: `Busca no armazenamento os grupos`
    },

    LoadedGroups: {
      states: {

        Groups: {
          states: {
            StoreCreatedGroupFailed: {},

            StoreCreatedGroup: {
              invoke: {
                src: "storeGroupToStorage",
                onDone: "idle",
                onError: "StoreCreatedGroupFailed"
              }
            },

            idle: {
              on: {
                CREATE_GROUP: "CreatingGroup"
              }
            },

            CreatingGroup: {
              invoke: {
                src: "createGroup",

                onDone: {
                  target: "StoreCreatedGroup",
                  actions: "saveGroupToContext"
                },

                onError: "GroupNotCreated"
              }
            },

            GroupNotCreated: {}
          },

          initial: "idle"
        }
      },

      type: "parallel"
    },
    FailedToLoadFromStorage: {
      description: `Não foi possivel ler os grupos salvos no armazenamento`
    }
  },

  initial: "LoadingGroups"
}, {
  actions: {
    saveGroupToContext: assign((context, event) => {
      const groupId = event.data.createdGroup.id;
      const newGroupIndex = [...context.groupsIndex];
      newGroupIndex.push(groupId);
      const updatedGroups = {...context.groups};
      updatedGroups[groupId] = event.data.createdGroup;

      return {
        groupsIndex: newGroupIndex,
        groups: updatedGroups,
      };
    }),
    saveGroupsToContext: assign((_, event) => event.data),
  },
});