import { Organization } from "../../models/organization";
import { StorageInstance, storageService } from "../../services/storage";

const userStorage = storageService.withInstanceID('user').withEncryption().initialize();

/** Salva organization no storage */
export const saveOrganization = (org: Organization, storage: StorageInstance = userStorage) => {
  return storage.setMap('org', org);
}

export const getPersistedOrg = (params: { storage?: StorageInstance } = {}) => {
  const { storage = userStorage } = params;
  return storage.getMap<Organization>('org');
}