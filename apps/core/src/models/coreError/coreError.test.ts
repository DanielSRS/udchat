import { describe, expect, it } from "@jest/globals";
import { CoreError } from "./coreError";
import { ErrorCode } from "./errorCode";

const message = 'Err msg';
const errorCode: ErrorCode = 'CUFWNIER';
const errors: string[] = [];

describe('Instanciando CoreError', () => {
  it('Se CoreError pode ser instanciado sem a keyword new', () => {
    const error = CoreError({
      code: errorCode,
      erros: errors,
      message: message,
      details: undefined,
    });
    expect(error).toBeInstanceOf(CoreError);
  });
  
  it('Se CoreError pode ser instanciado com a keyword new', () => {
    const error = new CoreError({
      code: errorCode,
      erros: errors,
      message: message,
      details: { extrainfo: {} },
    });
    expect(error).toBeInstanceOf(CoreError);
  });
});

it('toString retorna o codigo de erro e a mensagem', () => {
  const error = new CoreError({
    code: errorCode,
    erros: errors,
    message: message,
    details: { extrainfo: {} },
  });
  expect(error.toString()).toBe(`Error: ${errorCode} - ${message}`);
});

it('Os valores passados ao construtor são retornados corretamente', () => {
  const extrainfo = { extrainfo: {} }
  const error = new CoreError({
    code: errorCode,
    erros: errors,
    message: message,
    details: extrainfo,
  });
  expect(error.code).toBe(errorCode);
  expect(error.erros).toBe(errors);
  expect(error.message).toBe(message);
  expect(error.details).toBe(extrainfo);
});
