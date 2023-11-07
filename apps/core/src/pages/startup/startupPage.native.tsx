import { Button, StyleSheet, Text, View } from 'react-native';
import { match as EitherMatch } from 'fp-ts/lib/Either';
import { useMachine } from '@xstate/react';
import { startupMachine } from '../../machines';
import { createUser, getPersistedUserTRH } from '../../managers/user/userManager';
import { pipe } from 'fp-ts/lib/function';

export const Startup = () => {
  const [state, send] = useMachine(startupMachine, {
    services: {
      getUser: getPersistedUserTRH,
      getOrg: () => new Promise((_, r) => r()),
    }
  });

  const initialState = state.matches('findingUser');
  const noUSer = state.matches('noUserFound');
  const findingOrg = state.matches('findingOrg');
  const noOrgFound = state.matches('noOrgFound');
  const started = state.matches('started');

  return (
    <View style={styles.container}>
      {!initialState ? null : (
        <Text>Initial state</Text>
      )}
      {!noUSer ? null : (
        <>
          <Text>no user</Text>
          <Button title={'Create user'} onPress={async () => {
            const newUser = await createUser();
            pipe(
              newUser,
              EitherMatch(
                error => {console.log('Failed user creation', JSON.stringify(error, null, 2))},
                user => { 
                  console.log('created user: ', user.encriptionKeys.privateKey);
                  send({ type: 'CREATE_USER' });
                },
              ),
            );
          }} />
        </>
      )}
      {!findingOrg ? null : (
        <Text>findingOrg</Text>
      )}
      {!noOrgFound ? null : (
        <>
          <Text>noOrgFound</Text>
          <Button title={'Create organization'} onPress={() => send({ type: 'CREATE_ORG' })} />
        </>
      )}
      {!started ? null : (
        <Text>started</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});
