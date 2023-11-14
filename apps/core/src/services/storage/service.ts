import { fileStorageLoader } from "./fileStorage";
import { StorageLoader } from "./loader";

export const storageService: StorageLoader = fileStorageLoader();
