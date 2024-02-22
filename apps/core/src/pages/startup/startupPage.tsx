import React from 'react';
import { Box, Newline, Text } from 'ink';
import { useStatupMachine } from './useStatupMachine';
// import { initNodeService } from '../../services/node/nodeService';
import SelectInput from 'ink-select-input';

// initNodeService();

export const StartupPage = () => {
  const { send, state } = useStatupMachine();
  if (!state || !send) {
    return null;
  }

  const initialState = state.matches('findingUser');
  const noUSer = state.matches('noUserFound');
  const loading = state.matches('creatingUser');
  const findingOrg = state.matches('findingOrg');
  const noOrgFound = state.matches('noOrgFound');
  const started = state.matches('started');
  const savingFailure = state.matches('savingFailure');

  const creatingOrg =
    state.matches('creatingOrganization') ||
    state.matches('savingOrgToStorage');
  const savingOrgFailure = state.matches('savingOrgFailure');
  const orgCreationErr = state.matches('orgCreationErr');

  const createUserResponse = (item: { value: boolean }) => {
    if (item.value) {
      send({ type: 'CREATE_USER' });
    }
  };

  const createOrgResponse = (item: { value: boolean }) => {
    if (item.value) {
      send({ type: 'CREATE_ORG' });
    }
  };

  const createUserOptions = [
    {
      label: 'Sim',
      value: true,
    },
    {
      label: 'Não',
      value: false,
    },
  ];

  return (
    <Box>
      {!initialState ? null : <Text>{'🔎 Buscando credenciais'}</Text>}
      {!loading ? null : <Text>{'...'}</Text>}
      {!creatingOrg ? null : <Text>{'>>>'}</Text>}
      {!noUSer ? null : (
        <Box flexDirection="column" justifyContent="space-between">
          <Text>{'😭 Nenhum usuário encontrado.'}</Text>
          <Box flexDirection="column">
            <Text>{'Deseja criar novo usuário?'}</Text>
            <SelectInput
              items={createUserOptions}
              onSelect={createUserResponse}
            />
          </Box>
        </Box>
      )}
      {!findingOrg ? null : <Text>{'🔎 Buscando organização'}</Text>}
      {!(savingFailure || savingOrgFailure) ? null : (
        <Text>{'Falha ao salvar no storage'}</Text>
      )}
      {!noOrgFound ? null : (
        <Box flexDirection="column" justifyContent="space-between">
          <Text>{'❌ Nenhuma organização, como pode?'}</Text>
          <Box flexDirection="column">
            <Text>{'Deseja criar nova organização?'}</Text>
            <SelectInput
              items={createUserOptions}
              onSelect={createOrgResponse}
            />
          </Box>
        </Box>
      )}
      {!orgCreationErr ? null : <Text>{'ERRRRRROUUUU, como pode?'}</Text>}
      {!started ? null : (
        <Box flexDirection="column">
          <Text>{'Todos os dados validados'}</Text>
          <Newline />
          <Text>{'|--------------- Organization ----------------'}</Text>
          <Text>{`| Data de criação: ${state.context.organization.creationDate}`}</Text>
          <Text>{'| Commits:'}</Text>
          {state.context.organization.commits.map(item => {
            return (
              <Text
                key={
                  item.data.createdAt
                }>{`|     ${item.type}: ${item.data.createdAt}`}</Text>
            );
          })}
          <Text>{'| membros:'}</Text>
          {state.context.organization.members.map(item => {
            return (
              <Text
                key={
                  item.username
                }>{`|    ${item.username} aka ${item.name}`}</Text>
            );
          })}
          <Text>{'|---------------------------------------------'}</Text>
        </Box>
      )}
    </Box>
  );
};
