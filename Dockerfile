FROM node:20-alpine3.19

WORKDIR /app

RUN corepack enable yarn

# Root
COPY package.json yarn.lock .yarnrc.yml ./

# cli app
COPY apps/cli/package.json ./apps/cli/

# core app
COPY apps/core/package.json ./apps/core/

# mobile app
COPY apps/mobile/package.json ./apps/mobile/

# socket package
COPY packages/socket/package.json ./packages/socket/

RUN yarn

COPY . .

RUN yarn bundle

CMD ["yarn", "cli"]
