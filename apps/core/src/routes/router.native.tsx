import React, { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../contexts/user/userContext';
import { OrgContext } from '../contexts/organization/orgContext';
import { StatsPage } from '../pages/stats/statsPage';
import { NoUserPage } from '../pages/nouser/noUserPage';
import { NoOrgPage } from '../pages/noorg/noOrgPage';
import { GroupsPage } from '../pages/groups/groupsPage';
import { GroupsProvider } from '../contexts/groups/groupsContext';
import { View } from '../libs/view/view';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const Router = () => {
  const userLoaded = useContextSelector(UserContext, data => data.userLoaded);
  const orgLoaded = useContextSelector(OrgContext, data => data.orgLoaded);

  if (!userLoaded) {
    return <NoUserPage />;
  }

  if (!orgLoaded) {
    return <NoOrgPage />;
  }

  return <TabExample />;
};

type TabsNames = 'group' | 'user' | 'org' | 'stats';

const TabExample = () => {
  const [activeTabName, setSctiveTabName] = useState<TabsNames>('group');
  // const [isTabFocused, setIsTabFocused] = useState(false);

  const handleTabChange = (name: TabsNames) => () => {
    // set the active tab name to do what you want with the content
    setSctiveTabName(name);
  };

  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: 0,
        flexShrink: 1,
        // @ts-ignore
        // backgroundColor: 'red',
      }}>
      <View
        style={{
          flexGrow: 1,
          flexBasis: 0,
          flexShrink: 1,
        }}>
        {activeTabName === 'group' && (
          <GroupsProvider>
            <GroupsPage />
          </GroupsProvider>
        )}
        {activeTabName === 'org' && <NoOrgPage />}
        {activeTabName === 'user' && <NoUserPage />}
        {activeTabName === 'stats' && <StatsPage />}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {/* Grupos */}
        <TouchableOpacity onPress={handleTabChange('group')} style={styles.tab}>
          <Text>{' Grupos '}</Text>
        </TouchableOpacity>
        {/* Usuário */}
        <TouchableOpacity onPress={handleTabChange('user')} style={styles.tab}>
          <Text>{' Usuário '}</Text>
        </TouchableOpacity>
        {/* Organização */}
        <TouchableOpacity onPress={handleTabChange('org')} style={styles.tab}>
          <Text>{' Organização '}</Text>
        </TouchableOpacity>
        {/* Estatísticas */}
        <TouchableOpacity onPress={handleTabChange('stats')} style={styles.tab}>
          <Text>{' Estatísticas '}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tab: {
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
});
