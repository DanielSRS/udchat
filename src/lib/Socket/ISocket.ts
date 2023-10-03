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

interface UPDSocket {
  /**
   * Recebe os dados enviados através do socket
   */
  receive: () => void;
  /**
   * Envia dados atraves do socket
   */
  send: () => void;
  close: () => void;
}