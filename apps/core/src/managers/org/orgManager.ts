import { CommitHistory } from '../../models/commitHistory';
import { Member } from '../../models/member';
import { Organization } from '../../models/organization';
import { OrgCreationCommit } from '../../models/organization/organization';
import { StorageInstance, storageService } from '../../services/storage';

const userStorage = storageService
  .withInstanceID('user')
  .withEncryption()
  .initialize();

/** Salva organization no storage */
export const saveOrganization = (
  org: Organization,
  storage: StorageInstance = userStorage,
) => {
  return storage.setMap('org', org);
};

export const deleteOrganization = (
  org: Organization,
  storage: StorageInstance = userStorage,
) => {
  return storage.removeItem('org');
};

export const getPersistedOrg = (params: { storage?: StorageInstance } = {}) => {
  const { storage = userStorage } = params;
  return storage.getMap<Organization>('org');
};

export const createOrg = (params: {
  // createdAt: string;
  createdBy: Member;
}) => {
  const creationCommitId = generateCommitId();
  const creationCommit: OrgCreationCommit = {
    type: 'orgCreation',
    data: {
      createdAt: new Date().getTime().toString(36),
      createdBy: params.createdBy,
      previousCommit: 'none',
      commitId: creationCommitId,
      from: params.createdBy.username,
    },
  };
  const history = CommitHistory();
  history.addToHistory(creationCommit);
  const newOrg = Organization({
    commits: history,
    creationDate: creationCommit.data.createdAt,
    members: [params.createdBy],
    firstCommit: creationCommitId,
  });
  if (newOrg._tag === 'Right') {
    const firstMemberCommitId = generateCommitId();
    newOrg.right.commits.addToHistory({
      type: 'ADD_MEMBER_TO_ORG_COMMIT',
      data: {
        commitId: firstMemberCommitId,
        createdAt: new Date().getTime().toString(36),
        newMember: params.createdBy,
        previousCommit: newOrg.right.firstCommit,
        from: params.createdBy.username,
      },
    });
  }

  return newOrg;
};

const generateCommitId = () => {
  const commitId = `${new Date().getTime().toString(36)}${generateRandomInteger(
    1234506789,
    9876054321,
  ).toString(36)}${new Date().getTime().toString(36)}`;
  return commitId;
};

const generateRandomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
