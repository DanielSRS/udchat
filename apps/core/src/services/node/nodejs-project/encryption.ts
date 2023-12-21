import { nodecrypto as crypto} from './libs';

export function publicEncrypt (params: { key: string; data: string }) {
  const logs: Array<string> = [];
  try {
    const d = () => (new Date());
    const antes = d();
    logs.push('Antes de encriptar: ' + antes.toTimeString());
    const encryptedData = crypto.publicEncrypt({
        key: params.key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
    }, Buffer.from(params.data));
    const depios = d()
    logs.push('Depois de encriptar: ' + depios.toTimeString())
    const data = encryptedData.toString('base64');
    logs.push('Terminado em: ' + (depios.getTime() - antes.getTime()) + 'ms');
    return {
      success: true,
      encryptedDataInBase64: data,
      logs: logs,
    };
  } catch(e) {
    return {
      error: e,
      logs: logs,
      success: false,
    };
  }
};

export function privateDecrypt (params: { key: string; data: string }) {
  try {
    const decrypto = crypto.privateDecrypt({
      key: params.key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    }, Buffer.from(params.data, 'base64'));
    return {
      success: true,
      decryptedData: decrypto.toString(),
    }
  } catch(e) {
    return {
      success: false,
      error: e,
    }
  }
}

export function sign (params: { key: string; data: string }) {
  try {
    const signer = crypto.createSign('sha256');
    signer.update(Buffer.from(params.data));
    const signature = signer.sign({
      key: params.key,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN,
    });

    return {
      logs: [] as string[],
      signature: signature.toString('base64'),
      sucess: true,
    }
  } catch(e) {
    return {
      sucess: false,
      error: e,
    }
  }
}

export function verify (params: { key: string; data: string; signature: string }) {
  try {
    const verifier = crypto.createVerify('sha256');
    verifier.update(Buffer.from(params.data));


    const isVerified = verifier.verify(
      {
        key: params.key,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN,
      },
      Buffer.from(params.signature, 'base64')
    );

    return {
      logs: [] as string[],
      valid: isVerified,
      success: true,
    }
  } catch(e) {
    return {
      success: false,
      error: e,
    }
  }
}

export const symetricEncryption = (data: string) => {
  // Configurando criptografia
  const encryptionAlgorithm = 'aes-256-ctr';
  const ENCRYPTION_KEY = crypto.randomBytes(32);
  const IV_LENGTH = 16;
  const encoding: BufferEncoding = 'base64'

  // criando cifra
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(encryptionAlgorithm, ENCRYPTION_KEY, iv);

  // encriptando
  const partialEncryption = cipher.update(data);
  const encryptedText = Buffer.concat([iv, partialEncryption, cipher.final()]);
  return {
    encryptedText: encryptedText.toString(encoding),
    base64EncryptionKey: ENCRYPTION_KEY.toString(encoding),
    encryptionAlgorithm,
  };
}

export function symetricDecryption(encryptedDataInBase64: string, encryptionKeyInBase64: string) {
  const initiated = new Date();
  const logs: Array<string> = [];
  logs.push(`Initiated at: ${initiated.toTimeString()}`);

  // Configurando criptografia
  const encryptionAlgorithm = 'aes-256-ctr';
  const ENCRYPTION_KEY = Buffer.from(encryptionKeyInBase64, 'base64');
  const encoding: BufferEncoding = 'base64'
  const IV_LENGTH = 16;


  // Decriptando
  const encryptedText = Buffer.from(encryptedDataInBase64, encoding);
  const iv = encryptedText.subarray(0, IV_LENGTH);
  const decipher = crypto.createDecipheriv(encryptionAlgorithm, ENCRYPTION_KEY, iv);
  const partialDecrypted = decipher.update(encryptedText.subarray(IV_LENGTH));
  const decrypted = Buffer.concat([partialDecrypted, decipher.final()]);

  const finalized = new Date();
  logs.push(`Finalized at: ${finalized.toTimeString()}`);
  logs.push(`Done in: ${finalized.getTime() - initiated.getTime()}ms`);
  return {
    decryptedData: decrypted.toString(),
    success: true,
    logs: logs,
  }
}

// module.exports = {
//   publicEncrypt,
//   privateDecrypt,
//   sign,
//   verify,
//   symetricEncryption,
//   symetricDecryption,
// }
