import { ZodError, ZodIssue, z } from 'zod';
import { Member, MemberSchema } from '../member';
import { Either, tryCatch as EitherTryCatch } from 'fp-ts/lib/Either';
import { CoreError, ErrorCodes } from '../coreError';
import { fromZodError } from 'zod-validation-error';
import { CommitHistory } from '../commitHistory';

// type OrgCommitType = 'orgCreation' | 'addMemberToOrg';

export interface OrgCreationCommit {
  type: 'orgCreation';
  data: {
    commitId: string;
    createdBy: Member;
    createdAt: string;
    previousCommit: 'none';
  };
}

export interface ADD_MEMBER_TO_ORG_COMMIT {
  type: 'ADD_MEMBER_TO_ORG_COMMIT';
  data: {
    newMember: Member;
    createdAt: string;
    previousCommit: string;
    commitId: string;
    from: string;
  };
}

// const OrgCreationCommitSchema = z.object({
//   type: z.literal('orgCreation'),
//   data: z.object({
//     createdBy: MemberSchema,
//     createdAt: z.string(),
//     commitId: z.string(),
//     previousCommit: z.literal('none'),
//   }),
// });

// type OrgCommit = OrgCreationCommit | ADD_MEMBER_TO_ORG_COMMIT;

// const OrgCommitSchema = OrgCreationCommitSchema;

export interface Organization {
  /** Data de criação da organização */
  creationDate: string;
  /** Membros da organização */
  members: Array<Member>;
  commits: CommitHistory;
  firstCommit: string;
}

const OrganizationSchema = z.object({
  creationDate: z.string(),
  firstCommit: z.string(),
  members: z.array(MemberSchema),
  commits: z.instanceof(CommitHistory),
});

type OrganizationError = ReturnType<typeof CoreError<ZodIssue[]>>;

const createOrganizationError = (e: unknown) => {
  const error = fromZodError(e as ZodError, { prefix: null });
  return CoreError({
    code: 'OCWIDOMC',
    details: error.details,
    erros: error.message.split(';'),
    message: ErrorCodes.OCWIDOMC,
  });
};

export const Organization = (
  organization: Organization,
): Either<OrganizationError, Organization> => {
  return EitherTryCatch(
    () => OrganizationSchema.parse(organization),
    createOrganizationError,
  );
};
