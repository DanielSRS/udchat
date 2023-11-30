import { ZodError, ZodIssue, z } from "zod";
import { Member, MemberSchema } from "../member";
import { Either, tryCatch as EitherTryCatch } from "fp-ts/lib/Either";
import { CoreError, ErrorCodes } from "../coreError";
import { fromZodError } from "zod-validation-error";

type OrgCommitType = 'orgCreation' | 'addMemberToOrg';

export interface OrgCreationCommit {
  type: 'orgCreation';
  createdBy: Member;
  createdAt: string;
  previousCommit: 'none';
}

const OrgCreationCommitSchema = z.object({
  type: z.literal('orgCreation'),
  createdBy: MemberSchema,
  createdAt: z.string(),
  previousCommit: z.literal('none'),
});

type OrgCommit = OrgCreationCommit;

const OrgCommitSchema = OrgCreationCommitSchema;

export interface Organization {
  /** Data de criação da organização */
  creationDate: string;
  /** Membros da organização */
  members: Array<Member>
  commits: OrgCommit[];
};

const OrganizationSchema = z.object({
  creationDate: z.string(),
  members: z.array(MemberSchema),
  commits: z.array(OrgCommitSchema).min(1),
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
