import { StorageLoader } from "./loader";
import { mmkvStorageLoader } from "./mmkvStorage";

export const storageService: StorageLoader = mmkvStorageLoader();
