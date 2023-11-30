import { StorageInstance, StorageReadingError, StorageWritingError } from './instance';
import { StorageLoader } from './loader';
import { Either, left, right } from 'fp-ts/lib/Either';
import { CoreError, ErrorCodes } from '../../models/coreError';

/** Cria uma função que cria erros de leitura do storage */
function readingErr<T>(code: CoreError<any>['code'], expected: string) {
  return (val: unknown) => left(CoreError({
    code: code,
    details: {
      expectedValue: expected,
      valueReceived: val,
    } as StorageWritingError['details'] ,
    erros: [],
    message: ErrorCodes[code],
  }))
}

/** Erro de leitura de string no storage */
const stringReadingError = readingErr('NFPLSKVS', 'string');
/** Erro de leitura de map no storage */
const mapReadingError = readingErr('NFPLMKVS', 'object');
/** Erro de leitura de boolean no storage */
const booleanReadingError = readingErr('NFPLBKVS', 'boolean');
/** Erro de leitura de array no storage */
const arrayReadingError = readingErr('NFPLAKVS', 'array');

const database: { [key: string]: { [key: string]: any } } = {};


interface MMKVStorageProps {
  mmkvInstance: { [key: string]: any };
}
class MMKVStorage implements StorageInstance {
  private mmkvInstance: { [key: string]: any };

  constructor(props: MMKVStorageProps) {
    this.mmkvInstance = props.mmkvInstance;
  }

  setMap(key: string, value: object) {
    return new Promise<Either<StorageWritingError, true>>((resolve) => {
      this.mmkvInstance[key] = value;
      resolve(right(true));
    });
  }
  setString(
    key: string,
    value: string,
  ) {
    return new Promise<Either<StorageWritingError, true>>((resolve) => {
      this.mmkvInstance[key] = value;
      resolve(right(true));
    });
  }
  setBoolean(
    key: string,
    value: boolean,
  ) {
    return new Promise<Either<StorageWritingError, true>>((resolve) => {
      this.mmkvInstance[key] = value;
      resolve(right(true));
    });
  }
  setArray(
    key: string,
    value: any[],
  ) {
    return new Promise<Either<StorageWritingError, true>>((resolve) => {
      this.mmkvInstance[key] = value;
      resolve(right(true));
    });
  }
  removeItem(key: string) {
    return new Promise<Either<false, true>>((resolve) => {
      this.mmkvInstance[key] = undefined;
      resolve(right(true));
    });
  }
  getString(key: string) {
    return new Promise<Either<StorageReadingError, string>>((resolve) => {
      const val = this.mmkvInstance[key];
      typeof val === 'string'
        ? resolve(right(val))
        : resolve(stringReadingError(val));
    });
  }
  getMap<T>(key: string) {
    return new Promise<Either<StorageReadingError, NonNullable<T>>>((resolve) => {
      const val = this.mmkvInstance[key];
      val
        ? resolve(right(val))
        : resolve(mapReadingError(val));
    });
  }
  getBoolean(key: string) {
    return new Promise<Either<StorageReadingError, boolean>>((resolve) => {
      const val = this.mmkvInstance[key];
      val
        ? resolve(right(val))
        : resolve(booleanReadingError(val));
    });
  }
  getArray<T>(key: string) {
    return new Promise<Either<StorageReadingError, Array<T>>>((resolve) => {
      const val = this.mmkvInstance[key];
      val
        ? resolve(right(val))
        : resolve(arrayReadingError(val));
    });
  }
}


class MMKVStorageLoader implements StorageLoader {
  private instanceId: string;
  private encrypted: boolean;

  constructor() {
    this.instanceId = 'default';
    this.encrypted = false;
  }

  withInstanceID(id: string): this {
    this.instanceId = id;
    return this;
  }

  withEncryption(): this {
    this.encrypted = true;
    return this;
  }

  private initWithEncryption() {
    let db = database[this.instanceId];
    if (!db) {
      database[this.instanceId] = {};
      db = database[this.instanceId] as {};
    }
    return db;
  }

  private initWithNoEncryption() {
    let db = database[this.instanceId];
    if (!db) {
      database[this.instanceId] = {};
      db = database[this.instanceId] as {};
    }
    return db;
  }

  initialize(): StorageInstance {
    const storage = this.encrypted
      ? this.initWithEncryption()
      : this.initWithNoEncryption();
    return new MMKVStorage({ mmkvInstance: storage });
  }
}

export const mmkvStorageLoader = () => new MMKVStorageLoader();
