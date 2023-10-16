interface TCPSocketClient {
  /**
   * Recebe os dados enviados através do socket
   */
  receive: () => void;
  /**
   * Envia dados atraves do socket
   */
  send: () => void;
  /**
   * Encerra conexão
   */
  close: () => void;
}

interface TCPSocketServer {
  /**
   * Escuta por conexões no socket
   */
  listen: () => void;
  /**
   * Encerra servidor
   */
  close: () => void;
}

type UPDsendResponse = { sucess: true } | { sucess: false; errorCode: number }

export interface UPDSocket {
  /**
   * Recebe os dados enviados através do socket
   */
  receive: (params?: {
    port?: number;
    timeout?: number,
  }) => Promise<string>;
  /**
   * Envia dados atraves do socket
   */
  send: (params: {
    host: string;
    port: number;
    message: string;
  }) => UPDsendResponse;
  /** Fecha */
  close: () => void;
}