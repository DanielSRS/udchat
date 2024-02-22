import { Either } from 'fp-ts/lib/Either';
import { CoreError } from '../../models/coreError';

/** Storage reading error info */
interface SREInfo {
  valueReceived: unknown;
  expectedValue: string;
}

export interface StorageWritingError extends CoreError<SREInfo> {}
export interface StorageReadingError extends CoreError<SREInfo> {}

export interface StorageInstance {
  /**
   * Set an Object to storage for the given key.
   *
   * Note that this function does **not** work with the Map data type.
   *
   */
  setMap(
    key: string,
    value: object,
  ): Promise<Either<StorageWritingError, true>>;
  /**
   * Set a string value to storage for the given key.
   */
  setString(
    key: string,
    value: string,
  ): Promise<Either<StorageWritingError, true>>;
  /**
   * Set a boolean value to storage for the given key.
   *
   */
  setBoolean(
    key: string,
    value: boolean,
  ): Promise<Either<StorageWritingError, true>>;
  /**
   * Set an array to storage for the given key.
   */
  setArray(
    key: string,
    value: any[],
  ): Promise<Either<StorageWritingError, true>>;
  /**
   * Remove an item from storage for a given key.
   *
   */
  removeItem(key: string): Promise<Either<false, true>>;
  /**
   * Get the string value for the given key.
   */
  getString(key: string): Promise<Either<StorageReadingError, string>>;
  /**
   * Get then Object from storage for the given key.
   */
  getMap<T>(key: string): Promise<Either<StorageReadingError, NonNullable<T>>>;
  /**
   * Get the boolean value for the given key.
   */
  getBoolean(key: string): Promise<Either<StorageReadingError, boolean>>;
  /**
   * Get the array from the storage for the given key.
   */
  getArray<T>(key: string): Promise<Either<StorageReadingError, Array<T>>>;
}
