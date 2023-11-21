import { Member } from "../../models/member";
import { Organization } from "../../models/organization";
import { OrgCreationCommit } from "../../models/organization/organization";
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

export const createOrg = (params: {
  // createdAt: string;
  createdBy: Member;
}) => {
  const creationCommit: OrgCreationCommit = {
    createdAt: (new Date()).getTime().toString(36),
    createdBy: params.createdBy,
    previousCommit: 'none',
    type: 'orgCreation',
  };
  const newOrg = Organization({
    commits: [creationCommit],
    creationDate: '',
    members: [params.createdBy],
  });

  return newOrg;
}