import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isLeft } from 'fp-ts/lib/Either';
import { useMachine } from '@xstate/react';
import { startupMachine } from '../../machines';
import { genereateNewUser, getPersistedUser, saveUser } from '../../managers/user/userManager';
import { storageService } from '../../services/storage';
import { User } from '../../models/user/user';
import { ContextFrom } from 'xstate';

const userStorage = storageService.withInstanceID('user').withEncryption().initialize();

export const Startup = () => {
  const [state, send] = useMachine(startupMachine, {
    services: {
      getUser: getUserService,
      getOrg: () => new Promise((_, r) => r()),
      createUser: createUserService,
      saveUserToStorage: saveUserToStorageService,
    }
  });

  const initialState = state.matches('findingUser');
  const noUSer = state.matches('noUserFound');
  const loading = state.matches('creatingUser');
  const findingOrg = state.matches('findingOrg');
  const noOrgFound = state.matches('noOrgFound');
  const started = state.matches('started');
  const savingFailure = state.matches('savingFailure');

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Text>estado: {state.value}</Text>
          <Text>Contexto:</Text>
          <Text>{JSON.stringify(state.context, null, 2)}</Text>
        </View>
        {!initialState ? null : (
          <Text>Initial state</Text>
          )}
        {!loading ? null : (
          <View>
            <Text>Criando usuário</Text>
            <ActivityIndicator />
          </View>
        )}
        {!noUSer ? null : (
          <>
            <Text>no user</Text>
            <Button title={'Create user'} onPress={() => send({ type: 'CREATE_USER' })} />
          </>
        )}
        {!savingFailure ? null : (
          <>
            <Text>Falha ao salvar no storage</Text>
            <Button title={'tentar novamente'} onPress={() => send({ type: 'RETRY' })} />
            <Button title={'Valtar ao inicio'} onPress={() => send({ type: 'START_OVER' })} />
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
          <View>
            <Text>started</Text>
            <Button title={'Delete user'} onPress={() => userStorage.removeItem('user')} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

/** Rejectable promised version of createUser */
const createUserService = () => {
  return new Promise<{ user: User }>((resolve, reject) => {
    genereateNewUser()
      .then(val => {
        if (isLeft(val)) {
          return reject(val.left);
        }
        resolve({ user: val.right });
      })
  });
}

const saveUserToStorageService = (context: ContextFrom<typeof startupMachine>) => {
  return new Promise((resolve, reject) => {
    saveUser(context.user)
      .then(val => {
        if (isLeft(val)) {
          return reject(val.left);
        }
        resolve(true);
      })
  })
}

export const getUserService = () => {
  return new Promise<{ user: User }>((resolve, reject) => {
    getPersistedUser()
      .then(value => {
        if (isLeft(value)) {
          reject(value.left);
          return;
        }
        resolve({ user: value.right });
      })
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
