import { isLeft } from 'fp-ts/lib/Either';
import { ContextFrom } from 'xstate';
import { userMachine } from '../../machines';
import { User } from '../../models/user/user';
import {
  genereateNewUser,
  getPersistedUser,
  saveUser,
} from '../../managers/user/userManager';

/** Rejectable promised version of createUser */
export const createUserService = () => {
  return new Promise<{ user: User }>((resolve, reject) => {
    genereateNewUser().then(val => {
      if (isLeft(val)) {
        return reject(val.left);
      }
      resolve({ user: val.right });
    });
  });
};

export const saveUserToStorageService = (
  context: ContextFrom<typeof userMachine>,
) => {
  return new Promise((resolve, reject) => {
    saveUser(context.user).then(val => {
      if (isLeft(val)) {
        return reject(val.left);
      }
      resolve(true);
    });
  });
};

export const getUserService = () => {
  return new Promise<{ user: User }>((resolve, reject) => {
    getPersistedUser().then(value => {
      if (isLeft(value)) {
        reject(value.left);
        return;
      }
      resolve({ user: value.right });
    });
  });
};
