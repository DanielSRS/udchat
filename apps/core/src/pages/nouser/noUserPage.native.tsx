import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { UserContext } from '../../contexts/user/userContext';
import { ActivityIndicator, Button, Text, View } from 'react-native';

export const NoUserPage = () => {
  const findingUser = useContextSelector(UserContext, data => data.findingUser);
  const creatingUser = useContextSelector(
    UserContext,
    data => data.creatingUser,
  );
  const noUserFound = useContextSelector(UserContext, data => data.noUserFound);
  const savingFailure = useContextSelector(
    UserContext,
    data => data.savingFailure,
  );
  const createUser = useContextSelector(UserContext, data => data.createUser);

  // const createUserOptions = [
  //   {
  //     label: 'Sim',
  //     value: true,
  //   },
  //   {
  //     label: 'Não',
  //     value: false,
  //   },
  // ];

  return (
    <View>
      {!findingUser ? null : <Text>{'🔎 Buscando credenciais'}</Text>}
      {!creatingUser ? null : (
        <View>
          <Text>Criando usuário</Text>
          <ActivityIndicator />
        </View>
      )}
      {!noUserFound ? null : (
        <>
          <Text>no user</Text>
          <Button title={'Create user'} onPress={createUser} />
        </>
      )}
      {!savingFailure ? null : <Text>{'Falha ao salvar no storage'}</Text>}
    </View>
  );
};
