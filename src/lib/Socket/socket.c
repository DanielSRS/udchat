#include "socket.h"       //  SOCKET_VERSION
#include <netdb.h>        //  sockaddr_in, socket, AF_INET, SOCK_STREAM, connect
#include <strings.h>      //  bzero
#include <string.h>       //  memset
#include <stdlib.h>       //  calloc
#include <arpa/inet.h>    //  inet_addr
#include <unistd.h>       //  close
#include <stdbool.h>      //  bool
#include <stdio.h>        //  printf
#include <sys/socket.h>   //  addrinfo

NonAlocatedCString socketLibVersion() {
  return SOCKET_VERSION;
}

// Abstrai o tipo do endereço do socket. De modo que funcione com IPs tanto de versão 4 como 6
void *get_in_addr(struct sockaddr *sa) {
  if (sa->sa_family == AF_INET) {
    return &(((struct sockaddr_in*)sa)->sin_addr);
  }

  return &(((struct sockaddr_in6*)sa)->sin6_addr);
}

/*** Client */

/** Cria socket udp */
int createUDPClientSocket() {
    int sockfd;
 
    // socket create and verification
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd == -1) {
        // printf("socket creation failed...\n");
        // exit(0);
    }
    else {
      // printf("Socket successfully created..\n");
    }
 
    // // assign IP, PORT
    // bzero(&servaddr, sizeof(servaddr));
    // servaddr.sin_family = AF_INET;
    // servaddr.sin_addr.s_addr = inet_addr(host);
    // servaddr.sin_port = htons(port);

    return sockfd;
}

/** Informações do servidor udp para enviar informações */
struct addrinfo* createServerConnectionAddress(char *host, int port) {
  struct addrinfo configurationHints;                         // Parametros de confuguração para a função getaddrinfo
  struct addrinfo *addressInfo;                               // Resposta de chamada de getaddrinfo
  int configurationMemorySize = sizeof configurationHints;    // Tamanha da estrutura que gurda a configuração
  int THERE_WAS_NO_ERROR = 0;                                 // getaddrinfo executou sem nenhum erro.

  memset(&configurationHints, 0, configurationMemorySize);    // zerado a memória 

  /* Definindo os  parametros de configuração */
  configurationHints.ai_family = AF_UNSPEC;       // Escolha automática entre ipv4 e ipv6
  configurationHints.ai_socktype = SOCK_STREAM;   // Usa TCP como tipo da conexão
  configurationHints.ai_flags = AI_PASSIVE;       // Usar meu ip

  // Automaticamente preenche as informações da struct de endereço 
  int errorCode = getaddrinfo(host, "3490", &configurationHints, &addressInfo);

  /* Verifica se houve erro*/
  if (errorCode != THERE_WAS_NO_ERROR) {
      // const char *getaddrinfoErrorMessage = gai_strerror(errorCode);
      fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(errorCode));
      // onError();
      return NULL;
  }

  return addressInfo;
}

/** Libera a memoria alocada para o endereço */
void freeServerConnectionAddress(struct addrinfo *servaddr) {
  if (servaddr == NULL) return;
  freeaddrinfo(servaddr);
}

/** Fecha socket */
void closeUDPClientSocket(int socketfd) {
  close(socketfd);
}

void clientSend(int sockfd, char* msg, int msglen, struct addrinfo* address) {
  int numbytes = 0;
  printf("args: \nsockfd: %d\nmsg: %s\nmsglen: %d\naddress: %p", sockfd, msg, msglen, address);
  numbytes = sendto(sockfd, msg, msglen, 0, address->ai_addr, address->ai_addrlen);
  if (numbytes == -1) {
    perror("talker: sendto");
    exit(1);
  }

  printf("talker: sent %d bytes to -\n", numbytes);
}


/** Server */

/** Cria socket udp */
int createUDPServerSocket() {
  int sockfd;

  // socket create and verification
  sockfd = socket(AF_INET, SOCK_DGRAM, 0);

  return sockfd;
}

/** Informações do servidor udp para escutar */
bool bindServerAddress(int sockfd, char *host, int port) {
  struct sockaddr_in servaddr;

  // assign IP, PORT
  servaddr.sin_family = AF_INET;
  servaddr.sin_addr.s_addr = inet_addr(host);
  servaddr.sin_port = htons(port);

  if ((bind(sockfd, (struct sockaddr *) &servaddr, sizeof (servaddr))) == -1) {
    close(sockfd);
    perror("Can't bind");
    return false;
  }

  return true;
}

bool serverRead(int sockfd, struct sockaddr_storage *their_addr, char* messageToStopServer) {
  int numbytes = 0;
  int addr_len = sizeof(struct sockaddr_storage);
  char buf[1000];
  char ipadd[50];
  if ((numbytes = recvfrom(sockfd, buf, 1000 - 1 , 0,
      (struct sockaddr *) their_addr, &addr_len)) == -1) {
      perror("recvfrom");
      exit(1);
  }

  printf("listener: got packet from %s\n",
      inet_ntop(their_addr->ss_family,
          get_in_addr((struct sockaddr *) their_addr),
          ipadd, sizeof(ipadd)));

  printf("listener: packet is %d bytes long\n", numbytes);
  buf[numbytes] = '\0';
  printf("listener: packet contains \"%s\"\n", buf);
  if (strncmp(messageToStopServer, buf, 50) == 0) {
    return false;
  }

  return true;
}

void listenForConnections(int socketFileDescriptor) {
  struct sockaddr_storage originConnectionAddress; // Informações do endereço da conexão de origem
  socklen_t sin_size = sizeof originConnectionAddress;

  bool stayInLoop = true;
  char stopMessage[50];
  snprintf(stopMessage, 50, ";_stop~server~on~socket:{%d};", socketFileDescriptor);

  while(stayInLoop) {
    stayInLoop = serverRead(socketFileDescriptor, &originConnectionAddress, stopMessage);
  }

  printf("Stop listening\n");
}

void closeServerSocket(int socketFileDescriptor) {
  close(socketFileDescriptor);
}
