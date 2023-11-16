import { isLeft } from "fp-ts/lib/Either";
import { Organization } from "../../models/organization";
import { ContextFrom } from "xstate";
import { startupMachine } from "../../machines";
import { getPersistedOrg, saveOrganization } from "../../managers/org/orgManager";
import { User } from "../../models/user/user";
import { genereateNewUser, getPersistedUser, saveUser } from "../../managers/user/userManager";

/** Rejectable promised version of createUser */
export const createUserService = () => {
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

export const saveUserToStorageService = (context: ContextFrom<typeof startupMachine>) => {
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
export const createOrgService = () => {
  return new Promise<{ organization: Organization }>((resolve, reject) => {
    const newOrg = Organization({ creationDate: (new Date()).toISOString(), members: [] });
    if (isLeft(newOrg)) {
      return reject(newOrg.left);
    }
    return resolve({ organization: newOrg.right });
  });
}

export const saveOrgToStorageService = (context: ContextFrom<typeof startupMachine>) => {
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

export const getOrgService = () => {
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
