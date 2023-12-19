import React, { useState } from "react";
import { useContextSelector } from "use-context-selector";
import { GroupsContext } from "../../contexts/groups/groupsContext";
import { Text } from "../../libs/text/text";
import { View } from "../../libs/view/view";
import SelectInput from "ink-select-input";
import { Group } from "../../contexts/groups/groupsTypes";
import { Newline, useFocus, useInput } from "ink";

/**
 * Exibe a lista de grupos do usuário.
 * Opção de criar novo grupo.
 * Opção de navegar para um grupo
 */
export const GroupsPage = () => {
  const groups = useContextSelector(GroupsContext, data => data.groups);
  const createGroup = useContextSelector(GroupsContext, data => data.createGroup);
  const stateValue = useContextSelector(GroupsContext, data => data.stateValue);

  const [scroll, setScroll] = useState(0);

  useInput((input, key) => {
    // console.log(`input: ${input}`);
    // console.log(`key: ${JSON.stringify(key, null, 2)}`);
    if (key.upArrow) {
      setScroll(Math.max(0, scroll - 1));
    }

    if (key.downArrow) {
      setScroll(Math.min(groups.length - 5, scroll + 1));
    }
  });

  return (
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
      {/* Titulo */}
      <View style={{ paddingTop: 1, paddingLeft: 2, paddingBottom: 1 }}>
        <Text>{`Grupos: ${stateValue}`}</Text>
      </View>
      {/* Lista de grupos */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, height: 300 }}>
        {}
        <Text>{`Number of groups: ${groups.length}`}</Text>
        {/* Grupos */}
        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
          {groups.slice(scroll, scroll + 5).map((group, index) => {
            return (
              <GroupPreview key={index + ''} group={group} />
            );
          })}
        </View>
        <SelectInput items={[{ label: 'Criar grupo', value: true }]} onSelect={() => createGroup(`group ${new Date().getTime().toString(36)}`)} />
      </View>
    </View>
  );
}

const GroupPreview = ({ group }: {group: Group;}) => {
  const { isFocused } = useFocus();
  return (
    <View
      style={{
        borderStyle: 'round',
        padding: 10,
        borderColor: isFocused ? 'green' : undefined,
        flexDirection: 'row',
      }}>
      {/* Iniciais do grupo */}
      <View style={{ borderStyle: 'round'  }}>
        <Text>{`GR`}</Text>
      </View>
      {/* Nome e status do grupo */}
      <View>
        <Text>{`${group.name}`}</Text>
        <Text>{`${group.commits[0].data.commitId}`}</Text>
      </View>
    </View>
  );
}
