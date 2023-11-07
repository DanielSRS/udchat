import { Either, tryCatch as EitherTryCatch } from "fp-ts/lib/Either";
import { ZodError, ZodIssue, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { CoreError, ErrorCodes } from "../coreError";

/**
 * Par de chaves assimetricas
 */
export interface KeyPair {
  /** Chave publica  */
  publicKey: string;
  /** Chave privada */
  privateKey: string;
}

export const KeyPairSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
});

type KeyPairError = CoreError<ZodIssue[]>;

const createKeyPairError= (e: unknown) => {
  const error = fromZodError(e as ZodError, { prefix: null });
  return CoreError({
    code: 'KPCIDOMC',
    details: error.details,
    erros: error.message.split(';'),
    message: ErrorCodes['KPCIDOMC'],
  });
}

export const KeyPair = (keyPair: KeyPair): Either<KeyPairError, KeyPair> => {
  return EitherTryCatch(
    () => KeyPairSchema.parse(keyPair),
    createKeyPairError,
  );
};