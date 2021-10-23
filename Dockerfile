FROM node:10.24.0-alpine

WORKDIR /app/

RUN apk --no-cache update && apk add --no-cache bash openssh-client curl

COPY package.json ./

COPY yarn.lock ./

RUN apk add --no-cache  --virtual deps python make g++ krb5-dev git  && \
    yarn install --forzen-lockfile --production && \
    yarn cache clean && \
    apk del deps && \
    rm -rf /tmp/*

COPY . ./

CMD ["node", "/app/index.js"]
