FROM node:22.13.0-alpine

USER root
RUN apk add --no-cache ffmpeg

USER node

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm i

COPY --chown=node:node . .

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "node", "index.js" ]