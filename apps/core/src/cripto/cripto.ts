import { RSAKeyPairOptions, generateKeyPair } from "crypto";
import { Either, left, right } from "fp-ts/lib/Either";

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
interface KeyPair {
  /** Chave publica  */
  publicKey: string;
  /** Chave privada */
  privateKey: string;
}

/**
 * Cria um par de chaves criptográficas assimetricas
 */
export const generateAssimetricKeys = async () => {
  return new Promise<Either<Error, KeyPair>>((resolve) => {
    generateKeyPair('rsa', options, (error, publicKey, privateKey) => {
      if (!error) {
        return resolve(right({ publicKey, privateKey }));
      }

      return resolve(left(error));
    });
  });
};
