import { Either, left, right } from 'fp-ts/lib/Either';
import { GROUP_CREATION, Group } from '../../contexts/groups/groupsTypes';
import { Member } from '../../models/member';
import { StorageInstance, storageService } from '../../services/storage';
import { generateCommitId } from '../../utils/commitId';
import { generateRandomInteger } from '../../utils/randomInteger';

const groupsStorage = storageService
  .withInstanceID('groups')
  .withEncryption()
  .initialize();

/** Salva organization no storage */
export const saveGroup = (
  group: Group,
  storage: StorageInstance = groupsStorage,
) => {
  return storage.setMap(group.id, group);
};

/**
 * Recupera grupo do armazenamento
 */
export const getGroup = (params: {
  storage?: StorageInstance;
  groupId: string;
}) => {
  const { storage = groupsStorage, groupId } = params;
  return storage.getMap<Group>(groupId);
};

/**
 * Recupera o indice de grupos no armazenamento
 */
export const getGroupsIndex = (params: { storage?: StorageInstance }) => {
  const { storage = groupsStorage } = params;
  return storage.getArray<string>('index');
};

/**
 * Salva o indice de grupos no armazenamento
 */
export const saveGroupsIndex = (
  groupsIds: string[],
  storage: StorageInstance = groupsStorage,
) => {
  return storage.setArray('index', groupsIds);
};

/**
 * Recupera os grupos do armazenamento
 */
export const getGroups = async (params: { storage?: StorageInstance }) => {
  return new Promise<
    Either<
      unknown,
      {
        groupsIndex: string[];
        groups: { [key: string]: Group };
      }
    >
  >(async (resolve, _reject) => {
    const { storage = groupsStorage } = params;
    let groupIndex = await getGroupsIndex(params);
    let groupIds: string[] = [];
    if (groupIndex._tag === 'Left') {
      // console.log(`getGroups: groupIndex: ${JSON.stringify(groupIndex.left, null, 2)}`);

      /** Assume que se valueReceived não for uma instancia de Error, o arquivo simplesmente não existe  */
      if (groupIndex.left.details.valueReceived !== null) {
        // @ts-ignore
        const syscalError = groupIndex?.left?.details?.valueReceived?.errno;
        /** Ou se um arquivo não existe, entende-se que simplesmente não havia um valor salvo */
        if (syscalError !== -4058) {
          return resolve(left(groupIndex.left.erros));
        }
      }
    } else {
      groupIds = groupIndex.right;
    }
    const numberOfGroups = groupIds.length;
    const groups: { [key: string]: Group } = {};
    for (let index = 0; index < numberOfGroups; index++) {
      const groupId = groupIds[index];
      if (!groupId) {
        continue;
      }
      const group = await storage.getMap<Group>(groupId);

      if (group._tag === 'Left') {
        return resolve(group);
      }

      groups[groupId] = group.right;
    }
    return resolve(
      right({
        groupsIndex: groupIds,
        groups,
      }),
    );
  });
};

/**
 * Salva os grupos no armazenamento
 */
export const saveGroups = (params: {
  storage?: StorageInstance;
  groupsIds: string[];
  groups: { [key: string]: Group };
}) => {
  const { storage = groupsStorage } = params;
  return new Promise<Either<unknown[], true>>(async (resolve, _reject) => {
    const numberOfGroups = params.groupsIds.length;
    const errors: unknown[] = [];
    const groupsIndex: string[] = [];
    for (let index = 0; index < numberOfGroups; index++) {
      const groupId = params.groupsIds[index];
      if (!groupId) {
        continue;
      }

      const group = params.groups[groupId];
      if (!group) {
        continue;
      }

      const res = await saveGroup(group, storage);
      if (res._tag === 'Left') {
        errors.push(res.left);
        continue;
      }
      groupsIndex.push(groupId);
    }
    if (errors.length > 0) {
      return resolve(left(errors));
    }
    const res = await saveGroupsIndex(groupsIndex, storage);
    if (res._tag === 'Left') {
      errors.push(res.left);
      return resolve(left(errors));
    }
    return resolve(right(true));
  });
};

export const createGroup = (params: {
  /** Nome do grupo */
  groupName: string;
  /** usuário que criou o grupo */
  creatorMmemberInfo: Member;
}) => {
  const groupCreationDate = new Date().getTime().toString(36);
  const creationCommit: GROUP_CREATION = {
    type: 'GROUP_CREATION',
    data: {
      commitId: generateCommitId(),
      createdAt: groupCreationDate,
      createdBy: params.creatorMmemberInfo.username,
      previousCommit: 'none',
    },
  };
  const newGroup: Group = {
    id: generateGroupId({
      creatorUsername: params.creatorMmemberInfo.username,
      groupCreationDate: creationCommit.data.createdAt,
    }),
    name: params.groupName,
    createdAt: creationCommit.data.createdAt,
    commits: [creationCommit],
    members: [creationCommit.data.createdBy],
  };
  console.log(`createGroup (manager): ${JSON.stringify(newGroup, null, 2)}`);
  return newGroup;
};

const generateGroupId = (params: {
  /** username do usuário que criou o grupo */
  creatorUsername: string;
  /** data de criação do grupo */
  groupCreationDate: string;
}) => {
  return `${params.creatorUsername}_${
    params.groupCreationDate
  }${generateRandomInteger(123456789, 987654321).toString(36)}`;
};
