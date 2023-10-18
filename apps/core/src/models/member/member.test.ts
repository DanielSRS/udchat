import { expect, it } from "bun:test";
import { Member } from ".";
import { match as EitherMatch } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { CoreError } from "../coreError";

const VALID_MEMBER = { name: 'dan', username: 'dani' };

it('Retorna um "Member" quando os dados são válidos', () => {
  const res = Member(VALID_MEMBER);
  pipe(
    res,
    EitherMatch(
      () => { expect().fail('This member should be correct. this should not fail') },
      (member) => { expect(member).toStrictEqual(VALID_MEMBER) }
    ),
  );
});

it('Retorna uma instancia de CoreError quando os dados são invalidos', () => {
  const res = Member(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      (error) => { expect(error).toBeInstanceOf(CoreError) },
      () => { expect().fail('Invalid data. this should never pass') }
    ),
  );
});

it('Falha se args de Member forem undefined', () => {
  const res = Member(undefined as unknown as any);
  pipe(
    res,
    EitherMatch(
      (error) => { 
        expect(error.code).toBe('UEIUKLOC');
        expect(error.erros).toEqual(['Required']);
        expect(error.message).toBe('Member creation with invalid data');
       },
      () => { expect().fail('Invalid data. this should never pass') }
    ),
  );
});
