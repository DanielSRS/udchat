import { isLeft } from "fp-ts/lib/Either";
import { Organization } from "../../models/organization";
import { ContextFrom } from "xstate";
import { createOrg, deleteOrganization, getPersistedOrg, saveOrganization } from "../../managers/org/orgManager";
import { orgMachine } from "../../machines";

/** Rejectable promised version of Createorg */
export const createOrgService = (context: ContextFrom<typeof orgMachine>) => {
  return new Promise<{ organization: Organization }>((resolve, reject) => {
    const newOrg = createOrg({ createdBy: {
      name: 'member',
      username: 'member',
    } });
    if (isLeft(newOrg)) {
      console.log('o que rolou: ', JSON.stringify(newOrg.left, null, 2));
      return reject(newOrg.left);
    }
    return resolve({ organization: newOrg.right });
  });
}

export const saveOrgToStorageService = (context: ContextFrom<typeof orgMachine>) => {
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

export const deleteOrgFromStorageService = (context: ContextFrom<typeof orgMachine>) => {
  return new Promise((resolve, reject) => {
    deleteOrganization(context.organization)
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
