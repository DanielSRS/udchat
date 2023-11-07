import { interpret } from "xstate";
import { startupMachine } from "../../machines";
import { createInterface } from "readline";
import { stdin, stdout } from "process";
import { generateAssimetricKeys } from "../../cripto/cripto";
import { Member } from "../../models/member";
import { CoreError } from "../../models/coreError";
import { pipe } from "fp-ts/lib/function";
import { match as EitherMatch, isLeft, left as EitherLeft, right as EitherRight } from "fp-ts/lib/Either";
import { Organization } from "../../models/organization";
import { SystemError } from "bun";
import fs from 'node:fs/promises';
import { User } from "../../models/user/user";

/** Caminho do arquivo de chave privada do usuario */
const PRIVATE_KEY_PATH = "./database/keys/_myuserprivatekey.pem";
/** Caminho do arquivo de chave publica do usuario */
const PUBLIC_KEY_PATH = "./database/keys/_myuserpublickey.pem";
/** Caminho do arquivo de membro do usuario */
const MEMBER_PATH = "./database/members/_myuserMemberData.mem";
/** Caminho do arquivo da organização */
const ORGANIZATION_PATH = "./database/organizations/_myOrganizationData.mem";
const ORGANIZATION_DIR_PATH = "./database/organizations/";

export const startup = () => {
  const startupActor = interpret(startupMachine.withConfig({
    services: {
      getUser: getUserFromFs,
      getOrg: getOrgFromFs,
    }
  }));

  startupActor.subscribe(async (snapshot) => {
    const initialState = snapshot.matches('findingUser');
    const noUSer = snapshot.matches('noUserFound');
    const findingOrg = snapshot.matches('findingOrg');
    const noOrgFound = snapshot.matches('noOrgFound');
    const started = snapshot.matches('started');

    if (initialState) {
      console.log('🔎 Buscando credenciais');
    }

    if (noUSer) {
      console.log('😭 Nenhum usuário encontrado.');
      if(await createNewUser()) {
        startupActor.send({ type: 'CREATE_USER' });
      }
    }

    if (findingOrg) {
      console.log('🔎 Buscando organização');
    }

    if (noOrgFound) {
      console.log('❌ Nenhuma organização, como pode?');
      if(await createNewOrg()) {
        startupActor.send({ type: 'CREATE_ORG' });
      }
    }

    if (started) {
      console.log('✨ Todos os dados validados');
    }
  });

  startupActor.start();
};

const genereateNewUser = async () => {
  const pair = await generateAssimetricKeys();
  const newMember = Member({ name: 'name', username: 'username' });
  if (isLeft(pair) || isLeft(newMember)) {
    const a = [];
    isLeft(pair) ? a.push(pair.left): undefined;
    isLeft(newMember) ? a.push(newMember.left): undefined;

    return EitherLeft(CoreError({
      code: 'UCF00000',
      details: a,
      erros: a.map((e) => e.code),
      message: 'Não foi possivel criar membero'
    }));
  }

  return EitherRight({
    encriptionKeys: pair.right,
    member: newMember.right,
  })

}

/** Cria um novo usuário do app */
const createNewUser = async () => {
  const read = createInterface({ input: stdin, output: stdout });
  return new Promise<boolean>((resolve) => {
    read.question('Deseja criar novo usuário?\n\ns - Sim\nn - Não\n\n', async (ansewer) => {
      console.log()
      if(ansewer === 's') {
        console.log('🎉 Criando usuário');
        read.close();
        const user = await genereateNewUser();
        return pipe(
          user,
          EitherMatch(
            async () => {
              console.log('🪲 Erro! Usuário não criado.');
              return false;
            },
            async p => {
              console.log('✅ Usuário criado!');
              const a = await saveUserToFs(p)
              return a;
            }
          ),
          async res => { resolve(await res) },
        );
      }
  
      if(ansewer === 'n') {
        console.log('❌ Não é possivel continuar sem um usuário. Encerrando...');
        read.close();
        resolve(false);
        return;
      }
  
      console.log('💥 Resposta inválida! Encerrando...');
      read.close();
      resolve(false);
    });
  });
}

const generateNewOrg = async () => {
  return Organization({
    creationDate: (new Date()).toISOString(),
    members: [],
  });
}

/** Cria uma nova organização */
const createNewOrg = async () => {
  const read = createInterface({ input: stdin, output: stdout });
  return new Promise<boolean>((resolve) => {
    read.question('Deseja criar nova organização?\n\ns - Sim\nn - Não\n\n', async (ansewer) => {
      console.log()
      if(ansewer === 's') {
        console.log('🎉 Criando organização');
        read.close();
        const org = await generateNewOrg();
        return pipe(
          org,
          EitherMatch(
            async () => {
              console.log('🪲 Erro! Organização não criada.');
              return false;
            },
            async p => {
              console.log('✅ Organização criada!');
              return await saveOrgToFs(p);
            }
          ),
          async res => { resolve(await res) },
        );
      }
  
      if(ansewer === 'n') {
        console.log('❌ Não é possivel continuar sem uma organização. Encerrando...');
        read.close();
        return resolve(false);
      }
  
      console.log('💥 Resposta inválida! Encerrando...');
      read.close();
      resolve(false);
    });
  });
}

interface GetUserFromFs {
  (): Promise<User>;
}
/** Recupera o usuário do app do sistema de arquivos */
const getUserFromFs: GetUserFromFs = () => new Promise(async (resolve, reject) => {
  const privateKeyFile = Bun.file(PRIVATE_KEY_PATH);
  const publicKeyFile = Bun.file(PUBLIC_KEY_PATH);
  const memberFile = Bun.file(MEMBER_PATH);

  try {
    const privateKey = await privateKeyFile.text();
    const publicKey = await publicKeyFile.text();
    const member = await memberFile.json();
    const validateMember = Member(member);

    pipe(
      validateMember,
      EitherMatch(
        () => {
          reject(CoreError({
            code: 'OCWIDOMC',
            details: undefined,
            erros: [],
            message: 'Não foi possivel criar membero'
          }));
        },
        (m) => resolve({
          encriptionKeys: {
            privateKey,
            publicKey,
          },
          member: m,
        }),
      ),
    )
  } catch(e) {
    // console.log('Error: ', JSON.stringify({ e: e }, null, 2));
    reject(CoreError({
      code: 'OCWIDOMC',
      details: e,
      erros: [],
      message: 'Não foi possivel abrir as chaves do usuário'
    }));
  }
});

interface GetOrgFromFs {
  (): Promise<Organization>;
}
const getOrgFromFs: GetOrgFromFs = () => new Promise(async (resolve, reject) => {
  const organizationFile = Bun.file(ORGANIZATION_PATH);
  try {
    const organization = Organization(await organizationFile.json());
    pipe(
      organization,
      EitherMatch(
        (e) => {
          reject(CoreError({
            code: 'FTPOFD00',
            details: e,
            erros: [e.code],
            message: 'Organization data on the file is invalid',
          }));
        },
        org => resolve(org),
      ),
    )
  } catch(e) {
    reject(CoreError({
      code: 'NFPLADO0',
      details: e,
      erros: [],
      message: 'Falha ao abrir arquivo de organização',
    }))
  }
})

interface SaveUserToFs {
  (user: User): Promise<boolean>;
}
/** Salva o usuário do app no sistema de arquivos */
const saveUserToFs: SaveUserToFs = (user) => new Promise(async (resolve, reject) => {
  try {
    await Bun.write(PRIVATE_KEY_PATH, user.encriptionKeys.privateKey);
    await Bun.write(PUBLIC_KEY_PATH, user.encriptionKeys.publicKey);
    await Bun.write(MEMBER_PATH, JSON.stringify(user.member));

    resolve(true);
  } catch(e) {
    reject(CoreError({
      code: 'NFPSUSA0',
      details: e,
      erros: [],
      message: 'Não foi possivel salvar usuário'
    }));
  }
});

interface SaveOrgToFs {
  (org: Organization): Promise<boolean>;
}
/** Salva o organização no sistema de arquivos */
const saveOrgToFs: SaveOrgToFs = (org) => new Promise(async (resolve, reject) => {
  try {
    await createDirectories([ORGANIZATION_DIR_PATH]);
    await Bun.write(ORGANIZATION_PATH, JSON.stringify(org));

    resolve(true);
  } catch(e) {
    console.log(e);
    reject(CoreError({
      code: 'NFPSORSA',
      details: e,
      erros: [],
      message: 'Não foi possivel salvar organização'
    }));
  }
});

interface CreateDirectories {
  (directories: Array<string>): Promise<
  | { success: true; error: undefined }
  | { success: false; error: CoreError<SystemError>[] }
  >;
}

const createDirectories: CreateDirectories = async (directories) => {
  const errors: CoreError<SystemError>[] = [];
  directories.map(async dir => {
    try {
      await fs.mkdir(dir, { recursive: true });
      // console.log('diretorio criado: ', dir);
    } catch (error) {
      const err = error as SystemError;
      errors.push(CoreError({
        code: 'NFPCDIR0',
        details: err,
        erros: [err?.message],
        message: 'Erro ao criar diretório',
      }));
    }
  });
  
  if (errors.length === 0) {
    return { success: true };
  }

  return { success: false, error: errors };
}
