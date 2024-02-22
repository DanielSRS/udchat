import React, { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../contexts/user/userContext';
import { OrgContext } from '../contexts/organization/orgContext';
import { StatsPage } from '../pages/stats/statsPage';
import { NoUserPage } from '../pages/nouser/noUserPage';
import { NoOrgPage } from '../pages/noorg/noOrgPage';
import { GroupsPage } from '../pages/groups/groupsPage';
import { GroupsProvider } from '../contexts/groups/groupsContext';
import { Box, useInput } from 'ink';
import { Tab, Tabs } from 'ink-tab';

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

const TabExample = () => {
  const [activeTabName, setSctiveTabName] = useState<string>('');
  const [isTabFocused, setIsTabFocused] = useState(false);

  useInput((input, key) => {
    if (key.ctrl && input === 't') {
      setIsTabFocused(p => !p);
    }
  });

  const handleTabChange = (name: string) => {
    // set the active tab name to do what you want with the content
    setSctiveTabName(name);
  };

  return (
    <Box flexDirection="column" flexGrow={1} flexShrink={1} flexBasis={0}>
      <Tabs
        keyMap={{
          next: [],
          previous: [],
          useNumbers: false,
          useTab: true,
        }}
        showIndex={false}
        onChange={handleTabChange}
        isFocused={isTabFocused ? undefined : false}>
        <Tab name="group">{' Grupos '}</Tab>
        <Tab name="user">{' Usuário '}</Tab>
        <Tab name="org">{' Organização '}</Tab>
        <Tab name="stats">{' Estatísticas '}</Tab>
      </Tabs>
      <Box flexGrow={1} flexBasis={0} flexShrink={1}>
        {activeTabName === 'group' && (
          <GroupsProvider>
            <GroupsPage />
          </GroupsProvider>
        )}
        {activeTabName === 'org' && <NoOrgPage />}
        {activeTabName === 'user' && <NoUserPage />}
        {activeTabName === 'stats' && <StatsPage />}
      </Box>
    </Box>
  );
};
