import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useContextSelector } from 'use-context-selector';
import { GroupsContext } from '../../contexts/groups/groupsContext';
// import { OrgContext } from '../../contexts/organization/orgContext';
import { Group } from '../../contexts/groups/groupsTypes';

/**
 * Exibe a lista de grupos do usuário.
 * Opção de criar novo grupo.
 * Opção de navegar para um grupo
 */
export const GroupsPage = () => {
  const groups = useContextSelector(GroupsContext, data => data.groups);
  const createGroup = useContextSelector(
    GroupsContext,
    data => data.createGroup,
  );
  const loadedGroupsIdle = useContextSelector(
    GroupsContext,
    data => data.loadedGroupsIdle,
  );
  // const addingMembers = useContextSelector(GroupsContext, data => data.addingMembers);
  const stateValue = useContextSelector(GroupsContext, data => data.stateValue);

  // const org = useContextSelector(OrgContext, data => data.org);
  // const members = org.members;

  return (
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
      {/* Loaded Groups */}
      {!loadedGroupsIdle ? null : (
        <>
          {/* Titulo */}
          <View style={{ paddingTop: 20, paddingLeft: 20, paddingBottom: 20 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: 'black',
              }}>{`Grupos: ${stateValue}`}</Text>
          </View>
          {/* Lista de grupos */}
          <View
            style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, height: 300 }}>
            {}
            <Text>{`Number of groups: ${groups.length}`}</Text>
            {/* Grupos */}
            <View
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,
                borderWidth: 1,
              }}>
              {groups.map((group, index) => {
                return <GroupPreview key={index + ''} group={group} />;
              })}
            </View>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                padding: 20,
              }}
              onPress={() =>
                createGroup(`group ${new Date().getTime().toString(36)}`)
              }>
              <Text>Criar grupo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {/* Adicionando membros num grupo */}
      {/* {!addingMembers ? null : (
         <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
          {members.map((member, index) => {
            return (
              <Text key={index + ''}>{`@${member.username} at ${member.ip}`}</Text>
            );
          })}
        </View>
      )} */}
    </View>
  );
};

const GroupPreview = ({ group }: { group: Group }) => {
  return (
    <View
      style={{
        borderWidth: 1,
        padding: 10,
        // borderColor: isFocused ? 'green' : undefined,
        flexDirection: 'row',
      }}>
      {/* Iniciais do grupo */}
      <View style={{ borderWidth: 1 }}>
        <Text>{'GR'}</Text>
      </View>
      {/* Nome e status do grupo */}
      <View>
        <Text>{`${group.name}`}</Text>
        <Text>{`${group.commits[0].data.commitId}`}</Text>
      </View>
    </View>
  );
};
