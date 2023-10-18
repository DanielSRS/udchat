import { describe, expect, it } from "bun:test";
import { CoreError } from "./coreError";

const message = 'Err msg';
const errorCode = 'UEIUKLOC';
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
