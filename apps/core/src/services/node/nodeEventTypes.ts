//nodeEventTypes.ts

export type nodeRequestEvent =
  | {
      type: 'publicEncrypt';
      data: {
        /** Chave publica */
        key: string;
        value: string;
      };
    }
  | {
      type: 'privateDecrypt';
      data: {
        /** Chave privada */
        key: string;
        value: string;
      };
    }
  | {
      type: 'sign';
      data: {
        /** Chave privada */
        key: string;
        value: string;
      };
    }
  | {
      type: 'verify';
      data: {
        /** Chave publica */
        key: string;
        /** Dado para verificar */
        value: string;
        /** Assinatura do dado em base64 */
        signature: string;
      };
    }
  | {
      type: 'symetricEncryption';
      data: {
        value: string;
      };
    }
  | {
      type: 'symetricDecryption';
      data: {
        /** Chave em base64 */
        key: string;
        /** Dado em base64 */
        value: string;
      };
    };

export type nodeResponseEventType =
  | 'unkown'
  | 'publicEncrypt'
  | 'privateDecrypt'
  | 'sign'
  | 'symetricDecryption'
  | 'symetricEncryption'
  | 'verify';

export interface nodeResponseEventMap {
  unkown: {
    eventType: 'unkown';
    response: {
      logs: Array<string>;
    };
  };
  publicEncrypt: {
    eventType: 'publicEncrypt';
    response:
      | {
          success: true;
          logs: string[];
          encryptedDataInBase64: string;
        }
      | {
          success: false;
          logs: string[];
          error: unknown;
        };
  };
  privateDecrypt: {
    eventType: 'privateDecrypt';
    response:
      | {
          success: true;
          decryptedData: string;
        }
      | {
          success: false;
          error: unknown;
        };
  };
  sign: {
    eventType: 'sign';
    response:
      | {
          sucess: true;
          signature: string;
          logs: string[];
        }
      | {
          sucess: false;
          error: unknown;
        };
  };
  symetricDecryption: {
    eventType: 'symetricDecryption';
    response:
      | {
          success: boolean;
          logs: string[];
        }
      | {
          decryptedData: string;
          success: boolean;
          logs: string[];
        };
  };
  symetricEncryption: {
    eventType: 'symetricEncryption';
    response: {
      encryptedText: string;
      base64EncryptionKey: string;
      encryptionAlgorithm: string;
    };
  };
  verify: {
    eventType: 'verify';
    response:
      | {
          success: true;
          valid: boolean;
          logs: string[];
        }
      | {
          success: false;
          error: unknown;
        };
  };
}

export type nodeResponseEvent =
  | {
      eventType: 'unkown';
      response: {
        logs: Array<string>;
      };
    }
  | {
      eventType: 'publicEncrypt';
      response:
        | {
            success: true;
            logs: string[];
            encryptedDataInBase64: string;
          }
        | {
            success: false;
            logs: string[];
            error: unknown;
          };
    }
  | {
      eventType: 'privateDecrypt';
      response:
        | {
            success: true;
            decryptedData: string;
          }
        | {
            success: false;
            error: unknown;
          };
    }
  | {
      eventType: 'sign';
      response:
        | {
            sucess: true;
            signature: string;
            logs: string[];
          }
        | {
            sucess: false;
            error: unknown;
          };
    }
  | {
      eventType: 'symetricDecryption';
      response:
        | {
            success: boolean;
            logs: string[];
          }
        | {
            decryptedData: string;
            success: boolean;
            logs: string[];
          };
    }
  | {
      eventType: 'symetricEncryption';
      response: {
        encryptedText: string;
        base64EncryptionKey: string;
        encryptionAlgorithm: string;
      };
    }
  | {
      eventType: 'verify';
      response:
        | {
            success: true;
            valid: boolean;
            logs: string[];
          }
        | {
            success: false;
            error: unknown;
          };
    };
