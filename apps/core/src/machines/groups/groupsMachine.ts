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
  /** @xstate-layout N4IgpgJg5mDOIC5RQE4HsCuAHWBZAhgMYAWAlgHZgB0AMmvhBVAOLrawDEEalVFAbmgDW1VJhwESFanQZNW42AgFpC+AC6keAbQAMAXT37EoLGlilNPEyAAeiAIwB2AKxUALLoBMAZgc+nL11PAA4ANicAGhAAT0QAWhc3Ly8Qhy93Fx8g4NcwgF986LF2STJeWUZyFjYcDjAUdBQqLAAbDQAzNBQAWyoSiSJymXoqmsVlckE1K3IjIxszC1mbewR4lIcqPxc0sN0HMIddA6jYxCCt3fSQgE4Qp10w291bp0Li2rwh6VpRyAU7CogJwVAAyupumAAMIoMAaAG1Lg8agqET9L5lX6VRGKYFfcGQuGw+HqXHYSbTDRaOYGBZIEBLSw01aIEIHKjhB63ByHHy3dy3W7ROIIJK6KjPNJOIXuHxhCIFIogAbfKQVf4QEGwfF4iFQkkIrVIhpNFrtdRdXoYxRYjUMcmg7WEg1wo0gymqak6OkGRbmZnWBlrBzuNJUJyeN5hFwpWMuEWIFw8znuUIuTIHJLuD4qzE-e0QR0652kCCtMAcaEAJQAogBBAAqtYA+sxqwB5ACqAAV6aYAytg45Dl5ti5dE4fC59ikeQnzghUltbl4eV4ZQ4XroJy5c6q7SMHca8c7DZpqiDkbw0aJ8+qj0WT0Cz26L+MKSoZjT5n6GUyh1AENnDcMI0xcBwXCcMJpzedxEzFVIqGOcDXFXEIc2VA8C0fYtdSBc95BNRpunNTpuj6bCHz+Y9nVfUkiPET1vx9Qw-wHZYWWHBBQ10EJOR5HcMNuWM7hCBD3GODx9hAqcjjXBxCmVcg0CLeAGSo4Z-U4oMgISbIx1DAJpSFBV3EjBD4lDMIqB5UNJPZR5XiVT5bRwmixm1bTA3IVl1hSCVPDCDdJIyYKIMs3YqCyVxghCKDI3lGd93vYYPOLbzALsRBHjcLlNz5AUhUi24qF8MCgoeKCwJ8FK3OonFnydL5Mq4vSEFcHxOTCbleRgorhUXJC5Xi-Y5QcUbErq0p3MauiCX1Yk30dAAxfBSArCBWt07KeJjCU5JjLxDlOeDFx6pxosyDNbiOO4Nz3LDUuxTV5r1IkYWWprtt87jeUk6L4sgmNIzSUMEIVLqRPZcbgqeDDpsGBrXoJUtyzAH6-N5KdtnuNMwIml5sgQvrkKJ7wdx8eV-BCRG1TSubUYJQjL1qTG-sOUrfCCBV0kFMMF1FHwMOiqDJxOZNpUw1yZuR2imdPWoADk0HUc9IHZ9rDh66K11ean5REiS+OQ1C0xeF4Erpw8qDWjbIEbNBKhW9AekW-AYE13aNkjU3jOcUywIsxdDekqm7oVO4nEUpSgA */
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