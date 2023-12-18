import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useContextSelector } from "use-context-selector";
import { GroupsContext } from "../../contexts/groups/groupsContext";

/**
 * Exibe a lista de grupos do usuário.
 * Opção de criar novo grupo.
 * Opção de navegar para um grupo
 */
export const GroupsPage = () => {
  const groups = useContextSelector(GroupsContext, data => data.groups);
  const createGroup = useContextSelector(GroupsContext, data => data.createGroup);
  const stateValue = useContextSelector(GroupsContext, data => data.stateValue);
  return (
    <View style={{ flex: 1 }}>
      {/* Titulo */}
      <View style={{ paddingTop: 20, paddingLeft: 20, paddingBottom: 20 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'black' }}>{`Grupos: ${stateValue}`}</Text>
      </View>
      {/* Lista de grupos */}
      <View style={{ flex: 1, borderWidth: 1 }}>
        {}
        <Text>{`Number of groups: ${groups.length}`}</Text>
        {/* Grupos */}
        <View style={{ flex: 1 }}>
          {groups.map((group, index) => {
            return (
              <View key={index + ''} style={{ borderWidth: 1, padding: 10 }}>
                <Text>{`${group.name}`}</Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            padding: 20,
          }}
          onPress={() => createGroup(`group ${new Date().getTime().toString(36)}`)}>
          <Text>Criar grupo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
