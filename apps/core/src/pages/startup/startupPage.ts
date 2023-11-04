import { interpret } from "xstate";
import { startupMachine } from "../../machines";
import { createInterface } from "readline";
import { stdin, stdout } from "process";
import { KeyPair, generateAssimetricKeys } from "../../cripto/cripto";
import { Member } from "../../models/member";
import { CoreError } from "../../models/coreError";
import { pipe } from "fp-ts/lib/function";
import { match as EitherMatch, isLeft, left as EitherLeft, right as EitherRight } from "fp-ts/lib/Either";

/** Caminho do arquivo de chave privada do usuario */
const PRIVATE_KEY_PATH = "./database/keys/_myuserprivatekey.pem";
/** Caminho do arquivo de chave publica do usuario */
const PUBLIC_KEY_PATH = "./database/keys/_myuserpublickey.pem";
/** Caminho do arquivo de membro privada do usuario */
const MEMBER_PATH = "./database/members/_myuserMemberData.mem";

export const startup = () => {
  const startupActor = interpret(startupMachine.withConfig({
    services: {
      getUser: getUserFromFs,
    }
  }));

  startupActor.subscribe(async (snapshot) => {
    const initialState = snapshot.matches('findingUser');
    const noUSer = snapshot.matches('noUserFound');
    const onOrg = snapshot.matches('findingOrg');

    if (initialState) {
      console.log('🔎 Buscando credenciais');
    }

    if (noUSer) {
      console.log('😭 Nenhum usuário encontrado.');
      if(await createNewUser()) {
        startupActor.send({ type: 'CREATE_USER' });
      }
    }

    if (onOrg) {
      console.log('🔎 Buscando organização');
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

interface User {
  encriptionKeys: KeyPair;
  member: Member;
}

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
