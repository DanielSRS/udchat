export const ErrorCodes = {
  MCWIDOMC: 'Member creation with invalid data on model constructor',
  EKCF0000: 'Encription keys creation failed',
  OCWIDOMC: 'Organization creation with invalid data on model constructor'
} as const;

/** https://stackoverflow.com/questions/59251860/use-keys-of-an-object-as-union-type */
export type ErrorCode = keyof typeof ErrorCodes;