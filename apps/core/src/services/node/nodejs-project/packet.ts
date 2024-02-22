const MAX_MTU_DATA_SIZE = 65_507;
const HEADER_MAX_SIZE = 300;
const MAX_DATA_SIZE = MAX_MTU_DATA_SIZE - HEADER_MAX_SIZE;
const SEPARATOR_STRING = '\r\n';

/**
 * Separe dados grandes em blocos menores
 *
 * tamanho maximo da mensagem: 64k https://nodejs.org/api/dgram.html#note-about-udp-datagram-size
 * 65,535 bytes no total;
 * 8 bytes UDP header
 * 20 bytes IP header
 * 65_507 bytes DADOS!!!!!
 * 65,507 bytes = 65,535 − 8 bytes UDP header − 20 bytes IP header
 * @param {object} params
 * @param {Buffer} params.data
 * @param {string=} params.id Id do grupo de pacotes. o receptor usa o id para remontar os dados
 * @returns
 */
export const preparePackets = (params: { data: Buffer; id?: string }) => {
  const {
    data,
    id = `${new Date().getTime().toString(36).toUpperCase()}_${
      data.length
    }_${4321}`,
  } = params;
  /**
   * Calcula quantos pacotes vão ser criados de acordo com o
   * tamanho total dos dados a serem enviados
   */
  const dataSize = data.length; // console.log('message total size: ', dataSize);
  const numberOfPacketsToSend = Math.ceil(dataSize / MAX_DATA_SIZE); // console.log('numberOfPacketsToSend: ', numberOfPacketsToSend);

  /** @type {Array<Buffer>}  */
  const packets = [];

  /**
   * Separa os dados em pacotes
   */
  for (let i = 0; i < numberOfPacketsToSend; i++) {
    const dataOffset = i * MAX_DATA_SIZE;
    const dataLength = Math.min(MAX_DATA_SIZE, dataSize - dataOffset);
    // console.log(`${i}: Offset: ${offset} - Length: ${length}`);

    const header = {
      /** Versão o programa/protocolo */
      version: '0.0.1',
      /** Id do grupo de pacotes. todas as partes precisam ter o mesmo id */
      commitId: id,
      /** Tamanho do corpo/dados do pacote */
      bodyPartSize: dataLength,
      /**
       * Número de ordem da fatia de dados. Estritamente nescessario para que os dados sejam
       * reconstruídos na ordem correta.
       */
      partNumber: i,
    };

    const HEADER = Buffer.from(JSON.stringify(header) + SEPARATOR_STRING);
    const body = data.subarray(dataOffset, dataOffset + dataLength); //data.substring(offset, offset + length);
    const msg = Buffer.concat([HEADER, body]);

    packets.push(msg);
  }

  return packets;
};

// module.exports = {
//   preparePackets,
// }
