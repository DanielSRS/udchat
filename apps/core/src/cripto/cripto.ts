import { RSAKeyPairOptions, generateKeyPair } from "crypto";
import { Either, left, right } from "fp-ts/lib/Either";
import { CoreError } from "../models/coreError";

const options: RSAKeyPairOptions<"pem", "pem"> = {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem"
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  }
}

/**
 * Par de chaves assimetricas
 */
export interface KeyPair {
  /** Chave publica  */
  publicKey: string;
  /** Chave privada */
  privateKey: string;
}

/**
 * Cria um par de chaves criptográficas assimetricas
 */
export const generateAssimetricKeys = async () => {
  return new Promise<Either<CoreError<Error>, KeyPair>>((resolve) => {
    generateKeyPair('rsa', options, (error, publicKey, privateKey) => {
      if (!error) {
        return resolve(right({ publicKey, privateKey }));
      }

      return resolve(left(CoreError({
        code: 'EKCF0000',
        details: error,
        erros: [error.message],
        message: '',
      })));
    });
  });
};
