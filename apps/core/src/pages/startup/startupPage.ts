import { ContextFrom, interpret } from "xstate";
import { startupMachine } from "../../machines";
import { createInterface } from "readline";
import { stdin, stdout } from "process";
import { isLeft } from "fp-ts/lib/Either";
import { User } from "../../models/user/user";
import { genereateNewUser, getPersistedUser, saveUser } from "../../managers/user/userManager";

export const startup = () => {
  const startupActor = interpret(startupMachine.withConfig({
    services: {
      getUser: getUserService,
      getOrg: () => new Promise((_, r) => r()),
      createUser: createUserService,
      saveUserToStorage: saveUserToStorageService,
    }
  }).withContext({ user: {} as User }));

  startupActor.subscribe(async (snapshot) => {
    const initialState = snapshot.matches('findingUser');
    const noUSer = snapshot.matches('noUserFound');
    const loading = snapshot.matches('creatingUser');
    const findingOrg = snapshot.matches('findingOrg');
    const noOrgFound = snapshot.matches('noOrgFound');
    const started = snapshot.matches('started');
    const savingFailure = snapshot.matches('savingFailure');

    if (initialState) {
      console.log('🔎 Buscando credenciais');
    }

    if (loading) {
      console.log('...');
    }

    if (noUSer) {
      console.log('😭 Nenhum usuário encontrado.');
      await createNewUser().then(() => startupActor.send({ type: 'CREATE_USER' })).catch(() => {});
    }

    if (findingOrg) {
      console.log('🔎 Buscando organização');
    }

    if (savingFailure) {
      console.log('Falha ao salvar no storage');
    }

    if (noOrgFound) {
      console.log('❌ Nenhuma organização, como pode?');
      await createNewOrg().then(() => startupActor.send({ type: 'CREATE_ORG' })).catch(() => {});
    }

    if (started) {
      console.log('✨ Todos os dados validados');
    }
  });

  startupActor.start();
};

/** Cria um novo usuário do app */
const createNewUser = async () => {
  const read = createInterface({ input: stdin, output: stdout });
  return new Promise<boolean>((resolve, reject) => {
    read.question('Deseja criar novo usuário?\n\ns - Sim\nn - Não\n\n', async (ansewer) => {
      console.log()
      if(ansewer === 's') {
        console.log('🎉 Criando usuário');
        read.close();
        return resolve(true);
      }
  
      if(ansewer === 'n') {
        console.log('❌ Não é possivel continuar sem um usuário. Encerrando...');
        read.close();
        return reject(false);
      }
  
      console.log('💥 Resposta inválida! Encerrando...');
      read.close();
      return reject(false);
    });
  });
}

/** Cria uma nova organização */
const createNewOrg = async () => {
  const read = createInterface({ input: stdin, output: stdout });
  return new Promise<boolean>((resolve, reject) => {
    read.question('Deseja criar nova organização?\n\ns - Sim\nn - Não\n\n', async (ansewer) => {
      console.log()
      if(ansewer === 's') {
        console.log('🎉 Criando organização');
        read.close();
        return resolve(true);
      }
  
      if(ansewer === 'n') {
        console.log('❌ Não é possivel continuar sem uma organização. Encerrando...');
        read.close();
        return reject(false);
      }
  
      console.log('💥 Resposta inválida! Encerrando...');
      read.close();
      return reject(false);
    });
  });
}

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
