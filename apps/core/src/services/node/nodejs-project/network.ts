import dgram from 'dgram';

/**
 * 
 * @param {object} params 
 * @param {number} params.port
 * @param {string} params.broadcastIp
 * @typedef {object} BroadcastResponse
 * @property {boolean} success
 * @property {number} bytesSent
 * @property {unknown=} error
 * @returns {Promise<BroadcastResponse>}
 */
const broadcastMessage = (params: {
  port: number;
  broadcastIp: string;
}) => {
  const { broadcastIp, port } = params;
  const data = Buffer.from(JSON.stringify({ event: 'broadcast', myIp: 'none' }));
  
  // socket.setBroadcast(true);
  const sk = dgram.createSocket('udp4');
  return new Promise((resolve) => {
    sk.send(data, 0, data.length, port, broadcastIp, (err, bytes) => {
      // Check for errors
      if (err) {
        // console.error(`Socket error: ${err.stack}`);
        sk.close();
        return resolve({
          success: true,
          bytesSent: 0,
          error: err,
        });
      } else {
        // Print the number of bytes sent
        // console.log(`Socket sent ${bytes} bytes`);
        sk.close();
        return resolve({
          success: true,
          bytesSent: bytes,
        });
      }
    });
  });
}

/**
 * 
 * @param {object} params 
 * @param {Array<Buffer>} params.packets
 * @param {string} params.ip
 * @param {number} params.port
 */
const sendPackets = async (params) => {
  const { packets, ip, port } = params;
  const socket = dgram.createSocket('udp4');

  const /** @type {Array<string>} */ logs = [];
  // logs.push(`preparing to send: ${packets.length} packets`);

  /** To measure execution tme */
  const start = new Date().getTime();

  /** Enviando todos os pacotes */
  for (let a = 0; a < packets.length; a++) {
    await wait(300);
    const b = await new Promise((resolve, reject) => {
      // logs.push(`sending packet Nº ${a}: length ${packets[a].length}`);
      socket.send(packets[a], 0, packets[a].length, port, ip, (err, bytes) => {
        // Check for errors
        if (err) {
          logs.push(`Socket error: ${err.stack}`);
          return resolve(err);
        } else {
          // Print the number of bytes sent
          logs.push(`Socket sent ${bytes} bytes`);
          return resolve(bytes);
        }
      });
    })
  }

  const end = new Date().getTime();
  logs.push(`Done sending packets in ${end - start}ms`);
  // Close the socket
  socket.close();

  return logs;
}

/**
 * 
 * @param {object} params 
 * @param {string} params.id
 * @param {string} params.ip
 * @param {number} params.port
 * @param {number} params.dataTotalLength
 * @param {number} params.totalNumberOfPackets
 * @param {string} params.base64EncryptionKey
 */
const sendLeadingPacket = async (params) => {
  const { ip, port, dataTotalLength, totalNumberOfPackets, id, base64EncryptionKey } = params;
  const socket = dgram.createSocket('udp4');

  const /** @type {Array<string>} */ logs = [];
  // logs.push(`preparing to send: ${packets.length} packets`);

  /** To measure execution tme */
  // const start = new Date().getTime();

  const separator = '\r\n';
  const header = {
    version: '0.0.1',
    commitId: 'leading:' + id,
    dataTotalLength,
    totalNumberOfPackets,
    base64EncryptionKey,
  }

  const leadingHeader = Buffer.from(JSON.stringify(header) + separator);

  /** Enviando todos os pacotes */
  // logs.push(`sending packet Nº ${a}: length ${packets[a].length}`);
  console.log(`sending leading with length ${leadingHeader.length}`)
  socket.send(leadingHeader, 0, leadingHeader.length, port, ip, (err, bytes) => {
    // Check for errors
    if (err) {
      // logs.push(`Socket error: ${err.stack}`);
    } else {
      // Print the number of bytes sent
      // logs.push(`Socket sent ${bytes} bytes`);
      console.log(`Socket sent ${bytes} bytes`);
    }
  });
  await wait(300);

  // const end = new Date().getTime();
  // logs.push(`Done sending packets in ${end - start}ms`);
  // Close the socket
  socket.close();
}

async function wait( /** @type {number} */ millisseconds) {
  await new Promise((resolve) => setTimeout(() => resolve(undefined), millisseconds));
}

module.exports = {
  broadcastMessage,
  sendPackets,
  sendLeadingPacket,
}
