/** Resultado de envio de uma mensagem pela rede */
export interface SendMessageResponseEvent {
  type: 'sendMessageResponse';
  data:
    { logs: string[]; messageId: string }
    & (
      | { sucess: true; bytesSent: number; error: undefined }
      | { sucess: false; bytesSent: 0; error: Error }
    )
}

/** Mensagem recebida pela rede */
export interface NewMessageEvent {
  type: 'newMessage';
  data: {
    /** Mensagem recebida */
    message: {
      /** conteúdo da mensagem em formato de string */
      data: string;
      /** indica em que encoding esta o conteúdo da mensagem. no geral em base64 */
      enconding: BufferEncoding
    };
    info: {
      /** Endereço ip de quem enviou a mensage */
      address: string;
      /** Tipo do endereço ip: IPv4 ou IPv6 */
      family: string;
      /** Numero da porta de quem enviou */
      port: number;
      /** Tamanho total da mensagem em bytes */
      size: number;
    };
    /** Logs da função de recebeu a mensagem */
    logs: string[],
  };
}

/**
 * Estatisticas de uso da rede durante a execução do app
 */
export interface NetworkStats {
  /** Numero total de bytes recebidos pela rede */
  totalBytesSent: number;
  /** Numero total de bytes enviados pela rede */
  totalBytesReceived: number;
  /** Numero total de pacotes, ou seja, mensagens recebidas pela rede */
  totalPacketsSent: number;
  /** Numero total de pacotes, ou seja, mensagens enviadas pela rede */
  totalPacketsReceived: number;
  /** Mensagens/pacotes que não forem enviados por alguma falha */
  failedMessages: number;
}