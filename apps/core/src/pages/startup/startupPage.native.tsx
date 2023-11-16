import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isLeft } from 'fp-ts/lib/Either';
import { useMachine } from '@xstate/react';
import { startupMachine } from '../../machines';
import { genereateNewUser, getPersistedUser, saveUser } from '../../managers/user/userManager';
import { storageService } from '../../services/storage';
import { User } from '../../models/user/user';
import { ContextFrom } from 'xstate';
import { Organization } from '../../models/organization';
import { getPersistedOrg, saveOrganization } from '../../managers/org/orgManager';

const userStorage = storageService.withInstanceID('user').withEncryption().initialize();

export const Startup = () => {
  const [state, send] = useMachine(startupMachine, {
    services: {
      getUser: getUserService,
      getOrg: getOrgService,
      createUser: createUserService,
      saveUserToStorage: saveUserToStorageService,
      createOrg: createOrgService,
      saveOrgToStorage: saveOrgToStorageService,
    }
  });

  const initialState = state.matches('findingUser');
  const noUSer = state.matches('noUserFound');
  const loading = state.matches('creatingUser');
  const findingOrg = state.matches('findingOrg');
  const noOrgFound = state.matches('noOrgFound');
  const started = state.matches('started');
  const savingFailure = state.matches('savingFailure');

  const creatingOrg = state.matches('creatingOrganization') || state.matches('savingOrgToStorage');
  const savingOrgFailure = state.matches('savingOrgFailure');

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Text>estado: {state.value.toString()}</Text>
          <Text>Contexto:</Text>
          <Text>{Object.keys(state.context).join('\n')}</Text>
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
        {!creatingOrg ? null : (
          <View>
            <Text>Criando organization</Text>
            <ActivityIndicator />
          </View>
        )}
        {!noUSer ? null : (
          <>
            <Text>no user</Text>
            <Button title={'Create user'} onPress={() => send({ type: 'CREATE_USER' })} />
          </>
        )}
        {!(savingFailure || savingOrgFailure) ? null : (
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

/** Rejectable promised version of Createorg */
const createOrgService = () => {
  return new Promise<{ organization: Organization }>((resolve, reject) => {
    const newOrg = Organization({ creationDate: (new Date()).toISOString(), members: [] });
    if (isLeft(newOrg)) {
      return reject(newOrg.left);
    }
    return resolve({ organization: newOrg.right });
  });
}

const saveOrgToStorageService = (context: ContextFrom<typeof startupMachine>) => {
  return new Promise((resolve, reject) => {
    saveOrganization(context.organization)
      .then(val => {
        if (isLeft(val)) {
          return reject(val.left);
        }
        resolve(true);
      })
  })
}

const getOrgService = () => {
  return new Promise<{ organization: Organization }>((resolve, reject) => {
    getPersistedOrg()
      .then(value => {
        if (isLeft(value)) {
          reject(value.left);
          return;
        }
        resolve({ organization: value.right });
      })
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
