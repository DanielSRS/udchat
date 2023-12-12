import React from 'react';
import { Box, Newline, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../../contexts/user/userContext';


export const NoUserPage = () => {
  const findingUser = useContextSelector(UserContext, data => data.findingUser);
  const creatingUser = useContextSelector(UserContext, data => data.creatingUser);
  const noUserFound = useContextSelector(UserContext, data => data.noUserFound);
  const savingFailure = useContextSelector(UserContext, data => data.savingFailure);
  const createUser = useContextSelector(UserContext, data => data.createUser);

  const createUserResponse = (item: { value: boolean }) => {
		if (item.value) {
      createUser();
    }
	};

	const createUserOptions = [
		{
			label: 'Sim',
			value: true
		},
		{
			label: 'Não',
			value: false
		},
	];

  return (
    <Box>
      {!findingUser ? null : (
        <Text>{`🔎 Buscando credenciais`}</Text>
      )}
      {!creatingUser ? null : (
        <Text>{`...`}</Text>
      )}
      {!noUserFound ? null : (
        <Box flexDirection='column' justifyContent='space-between'>
          <Text>{`😭 Nenhum usuário encontrado.`}</Text>
          <Box flexDirection='column'>
            <Text>{`Deseja criar novo usuário?`}</Text>
            <SelectInput items={createUserOptions} onSelect={createUserResponse} />
          </Box>
        </Box>
      )}
      {!(savingFailure) ? null : (
        <Text>{`Falha ao salvar no storage`}</Text>
      )}
    </Box>
  );
}
