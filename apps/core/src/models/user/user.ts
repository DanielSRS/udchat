import { ZodError, ZodIssue, z } from "zod";
import { KeyPair, KeyPairSchema } from "../keyPair/keyPair";
import { Member, MemberSchema } from "../member";
import { CoreError, ErrorCodes } from "../coreError";
import { fromZodError } from "zod-validation-error";
import { Either, tryCatch as EitherTryCatch } from "fp-ts/lib/Either";

/** Usuário do app. Só existe um unico */
export interface User {
  /** Chaves criptograficas do usuário. A chave privada identifica um usuário unico */
  encriptionKeys: KeyPair;
  /** Informações de membro do usuário */
  member: Member;
}

export const UserSchema = z.object({
  encriptionKeys: KeyPairSchema,
  member: MemberSchema,
});

type UserError = CoreError<ZodIssue[]>;

const createUserError= (e: unknown) => {
  const error = fromZodError(e as ZodError, { prefix: null });
  return CoreError({
    code: 'UCWIDOMC',
    details: error.details,
    erros: error.message.split(';'),
    message: ErrorCodes['UCWIDOMC'],
  });
}

export const User = (user: User): Either<UserError, User> => {
  return EitherTryCatch(
    () => UserSchema.parse(user),
    createUserError,
  );
};