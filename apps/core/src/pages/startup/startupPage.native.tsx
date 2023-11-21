import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMachine } from '@xstate/react';
import { startupMachine } from '../../machines';
import { storageService } from '../../services/storage';
import {
  createOrgService,
  createUserService,
  getOrgService,
  getUserService,
  saveOrgToStorageService,
  saveUserToStorageService
} from './startupHelper';
import Lottie from 'lottie-react-native';
import badge from '../../assets/animations/verified_badge.json';

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
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <Text>{`|--------------- Organization ----------------`}</Text>
          <Text>{`| Data de criação: ${state.context.organization.creationDate}`}</Text>
          <Text>{`| Commits:        \n\t${state.context.organization.commits.map(v => v.type + ': ' + v.createdAt).join('\n\t')}`}</Text>
          <Text>{`| membros:        \n\t ${state.context.organization.members.map(m => m.username + ' aka ' + m.name).join('\n\t')}`}</Text>
          <Text>{`|---------------------------------------------\n`}</Text>
          <Lottie style={{ minHeight: 300 }} source={badge} autoPlay loop={false} />
          <Button title={'Delete user'} onPress={() => userStorage.removeItem('user')} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
