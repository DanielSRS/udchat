import { generateAssimetricKeys } from "../../cripto";
import { Member } from "../../models/member";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { CoreError, ErrorCodes } from "../../models/coreError";
import { User } from "../../models/user/user";
import { StorageInstance, storageService } from "../../services/storage";
import { ZodIssue } from "zod";
import { StorageWritingError } from "../../services/storage/instance";

const userStorage = storageService.withInstanceID('user').withEncryption().initialize();

/**
 * Na criação de um novo usuario, poder ocorrer os seguintes erros:
 * - Na criação das craves criptograficas
 * - Na criação do membro
 */
const genereateNewUser = async () => {
  const pair = await generateAssimetricKeys();
  const newMember = Member({ name: 'name', username: 'username' });

  if (isLeft(pair) || isLeft(newMember)) {
    const a = [];
    isLeft(pair) ? a.push(pair.left): undefined;
    isLeft(newMember) ? a.push(newMember.left): undefined;

    return left(CoreError({
      code: 'UCF00000',
      details: a,
      erros: a.map((e) => e.code),
      message: 'Não foi possivel criar membero'
    }));
  }

  const newUser = User({
    encriptionKeys: pair.right,
    member: newMember.right,
  });

  if (isLeft(newUser)) {
    return left(CoreError({
      code: 'UCF00000',
      details: [newUser.left],
      erros: [newUser.left.code],
      message: 'Não foi possivel criar membero'
    }));
  }

  return right(newUser.right);
}

interface UserCreationInstanceError {
  /** Indica se o erro foi causado na criação do objeto, ou durante a persistencia no storage */
  cause: 'GENERATION';
  info: CoreError<(CoreError<Error> | CoreError<ZodIssue[]>)[]>
}

interface UserCreationPersistError {
  /** Indica se o erro foi causado na criação do objeto, ou durante a persistencia no storage */
  cause: 'PERSISTENCE';
  info: StorageWritingError;
}

type UserCreationError = UserCreationInstanceError | UserCreationPersistError;

// type CreateUserResponse = Promise<Either<CoreError<UserCreationError>, User>>;

// interface CreateUser {
//   async (params: { storageService?: StorageInstance }): CreateUserResponse;
// }

/**
 * Cria um novo usuário do app
 * 
 * fluxo:
 * - Cria novo usuário
 * - Persiste o dado
 * - Retorna o usuário criado se não houver falhas
 */
export const createUser = async (params: { storageService?: StorageInstance } = {}): Promise<Either<CoreError<UserCreationError>, User>> => {
  const { storageService = userStorage } = params;
  /**
   * Poder ocorrer os seguintes erros:
   * - A criação da entidade user falhou
   * - Não foi possivel persistir o dado
   */
  const user = await genereateNewUser();

  /** Falha na criação da entidade */
  if (isLeft(user)) {
    return (left(CoreError({
      code: 'CUFWNIER',
      details: {
        cause: 'GENERATION',
        info: user.left
      },
      erros: [user.left.code, ...user.left.details.map(v => v.code)],
      message: ErrorCodes['CUFWNIER']
    })));
  }

  const stored = await storageService.setMap('user', user);

  /** Falha no armazenamento  */
  if (isLeft(stored)) {
    return (left(CoreError({
      code: 'CUFWSTER',
      details: {
        cause: 'PERSISTENCE',
        info: stored.left
      },
      erros: [stored.left.code],
      message: ErrorCodes['CUFWSTER']
    })));
  }

  return right(user.right);
  //
}

/** Salva user no storage */
export const saveUser = (user: User, storage: StorageInstance = userStorage) => {
  return storage.setMap('user', user);
}

export const getPersistedUser = (params: { storage?: StorageInstance } = {}) => {
  const { storage = userStorage } = params;
  return storage.getMap<User>('user');
}

export const getPersistedUserTRH = () => {
  return new Promise<User>((resolve, reject) => {
    getPersistedUser()
      .then(value => {
        if (isLeft(value)) {
          reject(value.left);
          return;
        }
        resolve(value.right);
      })
  })
}
