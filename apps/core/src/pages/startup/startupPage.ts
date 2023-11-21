import { ContextFrom, interpret } from "xstate";
import { startupMachine } from "../../machines";
import { createInterface } from "readline";
import { stdin, stdout } from "process";
import { User } from "../../models/user/user";
import { Organization } from "../../models/organization";
import {
  createOrgService,
  createUserService,
  getOrgService,
  getUserService,
  saveOrgToStorageService,
  saveUserToStorageService
} from "./startupHelper";

export const startup = () => {
  const startupActor = interpret(startupMachine.withConfig({
    services: {
      getUser: getUserService,
      getOrg: getOrgService,
      createUser: createUserService,
      saveUserToStorage: saveUserToStorageService,
      createOrg: createOrgService,
      saveOrgToStorage: saveOrgToStorageService,
    }
  }).withContext({ user: {} as User, organization: {} as Organization }));

  startupActor.subscribe(async (snapshot) => {
    const initialState = snapshot.matches('findingUser');
    const noUSer = snapshot.matches('noUserFound');
    const loading = snapshot.matches('creatingUser');
    const findingOrg = snapshot.matches('findingOrg');
    const noOrgFound = snapshot.matches('noOrgFound');
    const started = snapshot.matches('started');
    const savingFailure = snapshot.matches('savingFailure');

    const creatingOrg = snapshot.matches('creatingOrganization') || snapshot.matches('savingOrgToStorage');
    const savingOrgFailure = snapshot.matches('savingOrgFailure');

    if (initialState) {
      console.log('🔎 Buscando credenciais');
    }

    if (loading) {
      console.log('...');
    }

    if (creatingOrg) {
      console.log('>>>');
    }

    if (noUSer) {
      console.log('😭 Nenhum usuário encontrado.');
      await createNewUser().then(() => startupActor.send({ type: 'CREATE_USER' })).catch(() => {});
    }

    if (findingOrg) {
      console.log('🔎 Buscando organização');
    }

    if (savingFailure || savingOrgFailure) {
      console.log('Falha ao salvar no storage');
    }

    if (noOrgFound) {
      console.log('❌ Nenhuma organização, como pode?');
      await createNewOrg().then(() => startupActor.send({ type: 'CREATE_ORG' })).catch(() => {});
    }

    if (started) {
      console.log('✨ Todos os dados validados');
      console.log(`|--------------- Organization ----------------`);
      console.log(`| Data de criação: ${snapshot.context.organization.creationDate}`);
      console.log(`| Commits:        \n\t${snapshot.context.organization.commits.map(v => v.type + ': ' + v.createdAt).join('\n\t')}`);
      console.log(`| membros:        \n\t ${snapshot.context.organization.members.map(m => m.username + ' aka ' + m.name).join('\n\t')}`);
      console.log(`|---------------------------------------------\n`);
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
