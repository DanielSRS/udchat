'use strict';

const crypto = require('crypto');

/**
 * 
 * @param {object} params 
 * @param {string} params.key
 * @param {string} params.data
 */
function publicEncrypt (params) {
  /** @type {Array<string>} */
  const logs = [];
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

/**
 * 
 * @param {object} params 
 * @param {string} params.key
 * @param {string} params.data
 */
function privateDecrypt (params) {
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

/**
 * 
 * @param {object} params 
 * @param {string} params.key
 * @param {string} params.data
 */
function sign (params) {
  try {
    const signer = crypto.createSign('sha256');
    signer.update(Buffer.from(params.data));
    const signature = signer.sign({
      key: params.key,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN,
    });

    return {
      /** @type {string[]} */
      logs: [],
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

/**
 * 
 * @param {object} params 
 * @param {string} params.key
 * @param {string} params.data
 * @param {string} params.signature
 */
function verify (params) {
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
      /** @type {string[]} */
      logs: [],
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

/**
 * 
 * @param {string} data 
 * @returns 
 */
const symetricEncryption = (data) => {
  // Configurando criptografia
  const encryptionAlgorithm = 'aes-256-ctr';
  const ENCRYPTION_KEY = crypto.randomBytes(32);
  const IV_LENGTH = 16;
  /** @type {BufferEncoding} */
  const encoding = 'base64'

  // criando cifra
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(encryptionAlgorithm, ENCRYPTION_KEY, iv);

  // encriptando
  const partialEncryption = cipher.update(data);
  const encryptedText = Buffer.concat([partialEncryption, cipher.final()]);
  return {
    encryptedText: iv.toString(encoding) + ':' + encryptedText.toString(encoding),
    base64EncryptionKey: ENCRYPTION_KEY.toString(encoding),
    encryptionAlgorithm,
  };
}

/**
 * 
 * @param {string} encryptedDataInBase64 
 * @param {string} encryptionKeyInBase64 
 * @returns 
 */
function symetricDecryption(encryptedDataInBase64, encryptionKeyInBase64) {
  const initiated = new Date();
  /** @type {Array<string>}  */
  const logs = [];
  logs.push(`Initiated at: ${initiated.toTimeString()}`);

  // Configurando criptografia
  const encryptionAlgorithm = 'aes-256-ctr';
  const ENCRYPTION_KEY = Buffer.from(encryptionKeyInBase64, 'base64');
  /** @type {BufferEncoding} */
  const encoding = 'base64'

  const textParts = encryptedDataInBase64.split(':');
  /** Se o texto encriptado não estiver no formato correto */
  if (textParts.length !== 2) {
    const finalized = new Date();
    logs.push(`Found error at: ${finalized.toTimeString()}`);
    logs.push(`Done in: ${finalized.getTime() - initiated.getTime()}ms`);
    return {
      success: false,
      logs: logs,
    }
  }


  // Decriptando
  const iv = Buffer.from(textParts[0], encoding);
  const encryptedText = Buffer.from(textParts[1], encoding);
  const decipher = crypto.createDecipheriv(encryptionAlgorithm, ENCRYPTION_KEY, iv);
  const partialDecrypted = decipher.update(encryptedText);
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

module.exports = {
  publicEncrypt,
  privateDecrypt,
  sign,
  verify,
  symetricEncryption,
  symetricDecryption,
}
