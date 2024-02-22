import { MMKVInstance, MMKVLoader } from 'react-native-mmkv-storage';
import {
  StorageInstance,
  StorageReadingError,
  StorageWritingError,
} from './instance';
import { StorageLoader } from './loader';
import { Either, left, right } from 'fp-ts/lib/Either';
import { CoreError, ErrorCodes } from '../../models/coreError';

/** Cria uma função que cria erros de leitura do storage */
function readingErr<T>(code: CoreError<T>['code'], expected: string) {
  return (val: unknown) =>
    left(
      CoreError({
        code: code,
        details: {
          expectedValue: expected,
          valueReceived: val,
        } as StorageWritingError['details'],
        erros: [],
        message: ErrorCodes[code],
      }),
    );
}

/** Erro de escrita do map no storage */
const mapWritingError = readingErr('NFPSMKVS', 'boolean');
/** Erro de escrita de string no storage */
const stringWritingError = readingErr('NFPSSKVS', 'string');
/** Erro de escrita de boolean no storage */
const booleanWritingError = readingErr('NFPSBKVS', 'boolean');
/** Erro de escrita de array no storage */
const arrayWritingError = readingErr('NFPSAKVS', 'array');
/** Erro de leitura de string no storage */
const stringReadingError = readingErr('NFPLSKVS', 'string');
/** Erro de leitura de map no storage */
const mapReadingError = readingErr('NFPLMKVS', 'object');
/** Erro de leitura de boolean no storage */
const booleanReadingError = readingErr('NFPLBKVS', 'boolean');
/** Erro de leitura de array no storage */
const arrayReadingError = readingErr('NFPLAKVS', 'array');

interface MMKVStorageProps {
  mmkvInstance: MMKVInstance;
}
class MMKVStorage implements StorageInstance {
  private mmkvInstance: MMKVInstance;

  constructor(props: MMKVStorageProps) {
    this.mmkvInstance = props.mmkvInstance;
  }

  setMap(key: string, value: object) {
    return new Promise<Either<StorageWritingError, true>>(resolve => {
      this.mmkvInstance
        .setMapAsync(key, value)
        .then(val =>
          val ? resolve(right(true)) : resolve(mapWritingError(val)),
        )
        .catch(e => resolve(mapWritingError(e)));
    });
  }
  setString(key: string, value: string) {
    return new Promise<Either<StorageWritingError, true>>(resolve => {
      this.mmkvInstance
        .setStringAsync(key, value)
        .then(val =>
          val ? resolve(right(true)) : resolve(stringWritingError(val)),
        )
        .catch(e => resolve(stringWritingError(e)));
    });
  }
  setBoolean(key: string, value: boolean) {
    return new Promise<Either<StorageWritingError, true>>(resolve => {
      this.mmkvInstance
        .setBoolAsync(key, value)
        .then(val =>
          val ? resolve(right(true)) : resolve(booleanWritingError(val)),
        )
        .catch(e => resolve(booleanWritingError(e)));
    });
  }
  setArray(key: string, value: any[]) {
    return new Promise<Either<StorageWritingError, true>>(resolve => {
      this.mmkvInstance
        .setArrayAsync(key, value)
        .then(val =>
          val ? resolve(right(true)) : resolve(arrayWritingError(val)),
        )
        .catch(e => resolve(arrayWritingError(e)));
    });
  }
  removeItem(key: string) {
    return new Promise<Either<false, true>>(resolve => {
      const res = this.mmkvInstance.removeItem(key);
      res ? resolve(right(res)) : resolve(left(res));
    });
  }
  getString(key: string) {
    return new Promise<Either<StorageReadingError, string>>(resolve => {
      this.mmkvInstance
        .getStringAsync(key)
        .then(val =>
          typeof val === 'string'
            ? resolve(right(val))
            : resolve(stringReadingError(val)),
        )
        .catch(e => resolve(stringReadingError(e)));
    });
  }
  getMap<T>(key: string) {
    return new Promise<Either<StorageReadingError, NonNullable<T>>>(resolve => {
      this.mmkvInstance
        .getMapAsync<NonNullable<T>>(key)
        .then(val =>
          val ? resolve(right(val)) : resolve(mapReadingError(val)),
        )
        .catch(e => resolve(mapReadingError(e)));
    });
  }
  getBoolean(key: string) {
    return new Promise<Either<StorageReadingError, boolean>>(resolve => {
      this.mmkvInstance
        .getBoolAsync(key)
        .then(val =>
          typeof val === 'boolean'
            ? resolve(right(val))
            : resolve(booleanReadingError(val)),
        )
        .catch(e => resolve(booleanReadingError(e)));
    });
  }
  getArray<T>(key: string) {
    return new Promise<Either<StorageReadingError, Array<T>>>(resolve => {
      this.mmkvInstance
        .getArrayAsync<T>(key)
        .then(val =>
          val ? resolve(right(val)) : resolve(arrayReadingError(val)),
        )
        .catch(e => resolve(arrayReadingError(e)));
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
    return new MMKVLoader()
      .withInstanceID(this.instanceId)
      .withEncryption()
      .initialize();
  }

  private initWithNoEncryption() {
    return new MMKVLoader().withInstanceID(this.instanceId).initialize();
  }

  initialize(): StorageInstance {
    const storage = this.encrypted
      ? this.initWithEncryption()
      : this.initWithNoEncryption();
    return new MMKVStorage({ mmkvInstance: storage });
  }
}

export const mmkvStorageLoader = () => new MMKVStorageLoader();
