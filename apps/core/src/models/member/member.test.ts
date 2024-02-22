import { expect, it } from '@jest/globals';
import { Member } from '.';
import { match as EitherMatch } from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { CoreError, ErrorCodes } from '../coreError';

const VALID_MEMBER: Member = {
  name: 'dan',
  username: 'dani',
  ip: 'lskdfj',
  publicKey: 'sdkfjjlk',
};

it('Retorna um "Member" quando os dados são válidos', () => {
  const res = Member(VALID_MEMBER);
  pipe(
    res,
    EitherMatch(
      () => {
        throw 'This member should be correct. this should not fail';
      },
      member => {
        expect(member).toStrictEqual(VALID_MEMBER);
      },
    ),
  );
});

it('Retorna uma instancia de CoreError quando os dados são invalidos', () => {
  const res = Member(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      error => {
        expect(error).toBeInstanceOf(CoreError);
      },
      () => {
        throw 'Invalid data. this should never pass';
      },
    ),
  );
});

it('Falha se args de Member forem undefined', () => {
  const res = Member(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      error => {
        expect(error.code).toBe('MCWIDOMC');
        expect(error.erros).toEqual(['Required']);
        expect(error.message).toBe(ErrorCodes.MCWIDOMC);
      },
      () => {
        throw 'Invalid data. this should never pass';
      },
    ),
  );
});
