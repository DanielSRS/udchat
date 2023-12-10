import dgram from 'node:dgram';

type BroadcastResponse = Promise<
  | { success: true; bytesSent: number; }
  | { success: false; bytesSent: 0; error: unknown }
>


const broadcastMessage = (params: {
  port: number;
  broadcastIp: string;
}): BroadcastResponse => {
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
          success: false,
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


const sendPackets = async (params: {
  packets: Array<Buffer>;
  ip: string;
  port: number;
}) => {
  const { packets, ip, port } = params;
  const socket = dgram.createSocket('udp4');

  const /** @type {Array<string>} */ logs = [];
  // logs.push(`preparing to send: ${packets.length} packets`);

  /** To measure execution tme */
  const start = new Date().getTime();

  /** Enviando todos os pacotes */
  for (let a = 0; a < packets.length; a++) {
    await wait(300);
    const data = packets[a];
    if (!data) continue;
  
    const length = data.length;
    const b = await new Promise((resolve, reject) => {
      // logs.push(`sending packet Nº ${a}: length ${packets[a].length}`);
      socket.send(data, 0, length, port, ip, (err, bytes) => {
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

const sendLeadingPacket = async (params: {
  id: string;
  ip: string;
  port: number;
  dataTotalLength: number;
  totalNumberOfPackets: number;
  base64EncryptionKey: string;
}) => {
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

async function wait(millisseconds: number) {
  await new Promise((resolve) => setTimeout(() => resolve(undefined), millisseconds));
}

module.exports = {
  broadcastMessage,
  sendPackets,
  sendLeadingPacket,
}
