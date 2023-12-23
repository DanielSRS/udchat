# udchat

Ambiente de desenvolvimento.
- Instale o Nodejs >= 18
- Habilite o [corepack](https://nodejs.org/api/corepack.html) (opção recomendada para instalar o yarn 3 como gerenciador de pacotes)
- ```bash
  corepack enable
  ```
  ou
  ```bash
  corepack enable yarn
  ```
  ou instale o [Yarn](https://yarnpkg.com/getting-started/install) de outra maneira.

Instale as dependencias:

```bash
git clone https://github.com/DanielSRS/udchat
cd udchat
yarn install
```

Para compilar o app de linha de comando:

```bash
yarn bundle
```

Para executar o app de linha de comando:

```bash
yarn cli
```
