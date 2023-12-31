import { Either, tryCatch as EitherTryCatch } from "fp-ts/lib/Either";
import { fromZodError } from "zod-validation-error";
import { ZodError, ZodIssue, z } from "zod";
import { CoreError, ErrorCodes } from "../coreError";

/**
 * Membro de uma organização.
 */
export interface Member {
  /** Nome do membro da organização */
  readonly name: string;
  /** Nome de usuário do membro da organização. É unico */
  readonly username: string;
  readonly ip: string;
  readonly publicKey: string;
};

export const MemberSchema = z.object({
  name: z.string(),
  username: z.string(),
  ip: z.string(),
  publicKey: z.string(),
});

type MemberError = ReturnType<typeof CoreError<ZodIssue[]>>;

const createMemberError = (e: unknown) => {
  const error = fromZodError(e as ZodError, { prefix: null });
  return CoreError({
    code: 'MCWIDOMC',
    details: error.details,
    erros: error.message.split(';'),
    message: ErrorCodes['MCWIDOMC'],
  });
}

export const Member = (member: Member): Either<MemberError, Member> => {
  return EitherTryCatch(
    () => MemberSchema.parse(member),
    createMemberError,
  );
};
