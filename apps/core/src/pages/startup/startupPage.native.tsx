import { Button, StyleSheet, Text, View } from 'react-native';
import { generateAssimetricKeys } from '../../cripto';
import { isRight } from 'fp-ts/lib/Either';
import { useMachine } from '@xstate/react';
import { startupMachine } from '../../machines';

export const Startup = () => {
  const [state, send] = useMachine(startupMachine, {
    services: {
      getUser: () => new Promise((_, r) => r()),
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
          <Button title={'Create user'} onPress={() => send({ type: 'CREATE_USER' })} />
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
