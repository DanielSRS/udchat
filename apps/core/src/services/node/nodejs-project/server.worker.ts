import { parentPort } from 'worker_threads';
import { symetricDecryption } from './encryption';
import dgram from 'dgram';

const SEPARATOR = Buffer.from('\r\n');
const temporary = {}

const handleOnMessageEvent = (event) => {
  parentPort?.postMessage(event);
}

parentPort?.on('message', handleOnMessageEvent);

// Create a new socket instance
const socket = dgram.createSocket('udp4');
// Bind the socket to port 4321
socket.bind(4321);

// Register a listener for the 'message' event
socket.on('message', (msg, rinfo) => {
  try {
    const headerEndIndex = msg.indexOf(SEPARATOR) + SEPARATOR.length;
    if (headerEndIndex === -1) {
      return parentPort?.postMessage({
        info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
        error: 'separator not found'
      });
    }

    const parsedHeader = {
      info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
      // aqui pode dar erro
      header: JSON.parse(msg.toString('utf8', 0, headerEndIndex)),
    };


    const /** @type {string} */ commitId = parsedHeader.header.commitId;
    if (commitId.startsWith('leading:')) {
      // significa que vamos receber algo

      const id = commitId.substring('leading:'.length);
      const /** @type {number} */ totalNumberOfPackets = parsedHeader.header.totalNumberOfPackets;

      // @ts-ignore
      temporary[id] = {
        ...parsedHeader.header,
        acumulatedParts: new Array(totalNumberOfPackets).fill(undefined),
        missingParts: totalNumberOfPackets,
      };

      return parentPort?.postMessage(temporary);
    }

    /** Se recebido uma das partes */
    if (commitId in temporary) {
      const partNumber = parsedHeader.header.partNumber;

      // @ts-ignore
      temporary[commitId].acumulatedParts[partNumber] = msg.subarray(headerEndIndex);
      // @ts-ignore
      temporary[commitId].missingParts -= 1;

      // @ts-ignore
      if (temporary[commitId].missingParts === 0) {
        parentPort?.postMessage({ log: 'recebido todas as partes' });

        // @ts-ignore
        const /** @type {string} */ base64EncryptionKey = temporary[commitId].base64EncryptionKey;
        // @ts-ignore
        const dataTotalLength = temporary[commitId].dataTotalLength;
        // @ts-ignore
        const encryptedData = Buffer.concat(temporary[commitId].acumulatedParts).toString('base64');
        parentPort?.postMessage({ log: 'o que rolou?' + encryptedData.substring(0, 33) });

        if (encryptedData.length === dataTotalLength) {
          parentPort?.postMessage({ log: 'tamanho confere!!! ' + dataTotalLength });
        }

        const decry = symetricDecryption(encryptedData, base64EncryptionKey);

        parentPort?.postMessage({ log: decry.logs });
        parentPort?.postMessage({ log: 'dados descry: ' + decry.decryptedData?.substring(0, 50) });
      }

      // @ts-ignore
      return parentPort?.postMessage({...temporary[commitId], acumulatedParts: [] });
    }
    return parentPort?.postMessage(parsedHeader);
  } catch(e) {
    return parentPort?.postMessage({
      info: `Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`,
      error: e,
    });
  }
  // Print the received message and the sender's address
  // parentPort.postMessage(`Received message with length: ${msg.length} from ${rinfo.address}:${rinfo.port}`);
  // console.log(`Received: ${msg} from ${rinfo.address}:${rinfo.port}`);
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
