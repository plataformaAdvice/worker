ARG NODE_VERSION=18.17.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn run build

CMD ["node", "./dist/http/server.js"]