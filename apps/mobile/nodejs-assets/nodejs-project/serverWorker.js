// @ts-check
'use strict';
const { parentPort } = require('worker_threads');
const { symetricDecryption } = require('./encryption');
const dgram = require('node:dgram');

const SEPARATOR = Buffer.from('\r\n');
/**
 * @type {{ [key: string]: {
 * missingParts: number;
 * acumulatedParts: (Buffer | null)[];
 * base64EncryptionKey: string;
 * dataTotalLength: number;
 * } }}
 */
const temporary = {}

const createLogger = (/** @type {Array<string>} */ logBuffer) => ({ log: (/** @type {string} */ msg) => logBuffer.push(msg) });

/** Processa as mensagens recebidas */
const handleOnMessageEvent = (/** @type {unknown} */ event) => parentPort?.postMessage(event);
parentPort?.on('message', handleOnMessageEvent);

// Create a new socket instance
// and Bind the socket to port 4321
const socket = dgram.createSocket('udp4');
socket.bind(4321);


/** Encontra, se houver, a area ocupada pela header na mensagem */
const findHeaderEndIndex = (/** @type {Buffer} */ msg, /** @type {Buffer} */ separator) => msg.indexOf(separator) + separator.length;
const findHeaderEndAreaIndex = (/** @type {Buffer} */ message) => findHeaderEndIndex(message, SEPARATOR);


/** Faz o parse do cabeçalho da mensagem */
const parseMessageHeader = (/** @type {Buffer} */ msg, /** @type {number} */ headerLength, /** @type {dgram.RemoteInfo} */ info) => {
  try {
    const headerString = msg.toString('utf8', 0, headerLength);
    const /** @type {unknown} */ headerObject = JSON.parse(headerString);

    return {
      info: `Received message with length: ${msg.length} from ${info.address}:${info.port}`,
      header: headerObject,
      success: true,
    }
  }
  catch(parseError) {
    return {
      info: `Received message with length: ${msg.length} from ${info.address}:${info.port} but failed to parse header`,
      error: parseError,
      success: false,
    }
  }
}

/** Processa a mensagem recebida */
const processNewMessage = (/** @type {Buffer} */ msg, /** @type {dgram.RemoteInfo} */info) => {
  const /** @type {Array<string>} */ logs = [];
  const logger = createLogger(logs);

  /** Origem e tamanho da mensagem */
  logger.log(`Received message with length: ${msg.length} from ${info.address}:${info.port}`);

  /** Onde se espera que termine a area de header da mensagem recebida */
  const headerEndIndex = findHeaderEndAreaIndex(msg);
  logger.log(`header size: ${headerEndIndex + 1} bytes`);

  /** Se a mensagem não tem header */
  if (headerEndIndex === -1) {
    logger.log(`header not found in message`);
    return {
      logs,
    };
  }

  /** Tenta processar o cabeçalho */
  const parsedHeader = parseMessageHeader(msg, headerEndIndex, info);
  logger.log(parsedHeader.info);

  /** Se não foi possivel processar a header */
  if (!parsedHeader.success) {
    logger.log(`Irrecognizable header format`);
    return {
      logs,
      error: parsedHeader.error
    }
  };

  /** Se o header não for um objeto */
  if (!parsedHeader.header || typeof parsedHeader.header !== 'object' ) {
    logger.log(`invalid header format`);
    return {
      logs,
    }
  };

  /** Se o commitId não estiver presente no header */
  if (!('commitId' in parsedHeader.header) || typeof parsedHeader.header.commitId !== 'string') {
    logger.log(`Missing commitId in header.`);
    return {
      logs,
    }
  };

  /** Identificador da mensagem ou grupo de mensagem */
  const commitId = parsedHeader.header.commitId;

  /** SE é uma mensagem de identificação de grupo */
  if(commitId.startsWith('leading:')
    && 'totalNumberOfPackets' in parsedHeader.header
    && 'base64EncryptionKey' in parsedHeader.header
    && 'dataTotalLength' in parsedHeader.header
    && typeof parsedHeader.header.totalNumberOfPackets === 'number'
    && typeof parsedHeader.header.dataTotalLength === 'number'
    && typeof parsedHeader.header.base64EncryptionKey === 'string'
  ) {
    const commitGroupId = commitId.substring('leading:'.length);
    const totalNumberOfPackets = parsedHeader.header.totalNumberOfPackets;
    logger.log(`Lead message of group with id: ${commitGroupId}`);
    logger.log(`Number of packets that will arrive: ${totalNumberOfPackets}`);

    /** Guarda temporariamente as informações do grupo e todas as suas partes */
    const group = {
      ...parsedHeader.header,                                       // guarda todas as outras infos do grupo
      base64EncryptionKey: parsedHeader.header.base64EncryptionKey,
      dataTotalLength: parsedHeader.header.dataTotalLength,

      acumulatedParts: new Array(totalNumberOfPackets).fill(null),  // Todos as partes que se espera receber
      missingParts: totalNumberOfPackets,                           // Quantidade de partes que ainda não foi recebida
    };

    temporary[commitGroupId] = group;

    return {
      logs,
      acumulatedParts: group.acumulatedParts,
      missingParts: group.missingParts,
    }
  }

  /** Se a mensagem é parte de um grupo conhecido */
  const group = temporary[commitId];
  if (group && 'partNumber' in parsedHeader.header && typeof parsedHeader.header.partNumber === 'number') {
    const partNumber = parsedHeader.header.partNumber;                // numero da parte que foi recebida
    logger.log('part of a known group');
    logger.log(`part number: ${partNumber}`);


    group.acumulatedParts[partNumber] === null                        // Se recebendo uma das partes que ainda não tinha recebido
      ? group.missingParts -= 1                                       // Decrementa o numero de partes faltantes
      : undefined;                                                    // do contrario não faz nada

    group.acumulatedParts[partNumber] = msg.subarray(headerEndIndex); // Salva a parte recebida

    /** Se acabou de receber a ultima parte do grupo */
    if (group.missingParts === 0) {
      logger.log(`recebido todas as partes`);

      const base64EncryptionKey = group.base64EncryptionKey;
      // const dataTotalLength = group.dataTotalLength;
      // @ts-ignore nesse ponto eu tenho certeza que nenhum elemento de acumulatedParts é null
      const encryptedData = Buffer.concat(group.acumulatedParts).toString('base64');

      // Dados descriptografados
      const decry = symetricDecryption(encryptedData, base64EncryptionKey);
      logs.push(...decry.logs);

      delete temporary[commitId]  // Remove dos temporarios

      return {
        logs,
        decrypted: {
          success: decry.success,
          data: decry.decryptedData,
        }
      }
    }

    return {
      ...group,
      acumulatedParts: [],
    }
  }

  logger.log(`message part of an unknown group`);

  return {
    logs,
  }
}

// Register a listener for the 'message' event
socket.on('message', (msg, rinfo) => {
  const processed = processNewMessage(msg, rinfo);
  parentPort?.postMessage(processed);
});

// Register a listener for the 'error' event
socket.on('error', (err) => {
  // Print the error and close the socket
  console.error(`Socket error: ${err.stack}`);
  socket.close();
});

// Register a listener for the 'listening' event
socket.on('listening', () => {
  // Print the socket's address
  const address = socket.address();
  console.log(`Socket listening on ${address.address}:${address.port}`);
});
