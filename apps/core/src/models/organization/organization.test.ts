import { expect, it } from "@jest/globals";
import { Organization } from ".";
import { match as EitherMatch } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { CoreError, ErrorCodes } from "../coreError";

const VALID_ORGANIZATION: Organization = {
  creationDate: (new Date()).toISOString(),
  firstCommit: 'sldkfj',
  members: [],
  commits: [{
    data: {
      createdAt: '',
      commitId: 'asdf',
      createdBy: {
        name: 'name',
        username: 'username',
        ip: 'lsjdf',
        publicKey: 'aslçdkfjl',
      },
      previousCommit: 'none',
    },
    type: 'orgCreation',
  }],
};

it('Retorna um "Organization" quando os dados são válidos', () => {
  const res = Organization(VALID_ORGANIZATION);
  pipe(
    res,
    EitherMatch(
      (e) => { expect(e).toBe({}); throw 'This organization should be correct. this should not fail' },
      (organization) => { expect(organization).toStrictEqual(VALID_ORGANIZATION) }
    ),
  );
});

it('Retorna uma instancia de CoreError quando os dados são invalidos', () => {
  const res = Organization(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      (error) => { expect(error).toBeInstanceOf(CoreError) },
      () => { throw 'Invalid data. this should never pass' }
    ),
  );
});

it('Falha se args de Organization forem undefined', () => {
  const res = Organization(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      (error) => { 
        expect(error.code).toBe('OCWIDOMC');
        expect(error.erros).toEqual(['Required']);
        expect(error.message).toBe(ErrorCodes['OCWIDOMC']);
       },
      () => { throw 'Invalid data. this should never pass' }
    ),
  );
});
