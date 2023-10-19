import { interpret } from "xstate";
import { startupMachine } from "../../machines";
import { createInterface } from "readline";
import { stdin, stdout } from "process";
import { generateAssimetricKeys } from "../../cripto/cripto";
import { Member } from "../../models/member";
import { CoreError } from "../../models/coreError";
import { pipe } from "fp-ts/lib/function";
import { match as EitherMatch } from "fp-ts/lib/Either";

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

/** Cria um novo usuário do app */
const createNewUser = async () => {
  const read = createInterface({ input: stdin, output: stdout });
  return new Promise<boolean>((resolve) => {
    read.question('Deseja criar novo usuário?\n\ns - Sim\nn - Não\n\n', async (ansewer) => {
      console.log()
      if(ansewer === 's') {
        console.log('🎉 Criando usuário');
        read.close();
        const pair = await generateAssimetricKeys();
        return pipe(
          pair,
          EitherMatch(
            () => {
              console.log('🪲 Erro! Usuário não criado.');
              resolve(false);
            },
            async p => {
              console.log('✅ Usuário criado!');
              await saveUserToFs(p.privateKey, p.publicKey);
              resolve(true);
            }
          ),
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
  (): Promise<Member>;
}
/** Recupera o usuário do app do sistema de arquivos */
const getUserFromFs: GetUserFromFs = () => new Promise(async (resolve, reject) => {
  const privateKeyPath = "./database/keys/_myuserprivatekey.pem";
  const publicKeyPath = "./database/keys/_myuserpublickey.pem";
  const privateKeyFile = Bun.file(privateKeyPath);
  const publicKeyFile = Bun.file(publicKeyPath);

  try {
    const privateKey = await privateKeyFile.text();
    const publicKey = await publicKeyFile.text();
    const newMember = Member({
      name: 'name',
      username: 'username',
    });

    if (newMember._tag === 'Left') {
      reject(CoreError({
        code: 'OCWIDOMC',
        details: undefined,
        erros: [],
        message: 'Não foi possivel criar membero'
        }));
      return;
    }

    resolve(newMember.right);
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

interface SaveUserToFs {
  (pri: string, pub: string): Promise<boolean>;
}
/** Salva o usuário do app no sistema de arquivos */
const saveUserToFs: SaveUserToFs = (pr, pu) => new Promise(async (resolve, reject) => {
  const privateKeyPath = "./database/keys/_myuserprivatekey.pem";
  const publicKeyPath = "./database/keys/_myuserpublickey.pem";
  const privateKeyFile = Bun.file(privateKeyPath);
  const publicKeyFile = Bun.file(publicKeyPath);

  try {
    const privateKey = await Bun.write(privateKeyPath, pr);
    const publicKey = await Bun.write(publicKeyPath, pu);

    resolve(true);
  } catch(e) {
    console.log('Error: ', JSON.stringify({ e: e }, null, 2));
    reject(CoreError({
      code: 'OCWIDOMC',
      details: e,
      erros: [],
      message: 'Não foi possivel salvar as chaves do usuário'
    }));
  }
});
