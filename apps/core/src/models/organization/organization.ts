import { ZodError, ZodIssue, z } from "zod";
import { Member, MemberSchema } from "../member";
import { Either, tryCatch as EitherTryCatch } from "fp-ts/lib/Either";
import { CoreError, ErrorCodes } from "../coreError";
import { fromZodError } from "zod-validation-error";

interface Organization {
  /** Data de criação da organização */
  creationDate: string;
  /** Membros da organização */
  members: Array<Member>
};

const OrganizationSchema = z.object({
  creationDate: z.string().datetime(),
  members: z.array(MemberSchema),
});

type OrganizationError = ReturnType<typeof CoreError<ZodIssue[]>>;

const createOrganizationError= (e: unknown) => {
  const error = fromZodError(e as ZodError, { prefix: null });
  return CoreError({
    code: 'OCWIDOMC',
    details: error.details,
    erros: error.message.split(';'),
    message: ErrorCodes['OCWIDOMC'],
  });
}

export const Organization = (organization: Organization): Either<OrganizationError, Organization> => {
  return EitherTryCatch(
    () => OrganizationSchema.parse(organization),
    createOrganizationError,
  );
};
