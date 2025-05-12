FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .
RUN npm install

COPY ./src ./src
COPY ./tests ./tests
COPY ./tsconfig.json .
COPY ./jest.config.js .

RUN npm run build

FROM node:20-alpine
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm install --only=production
COPY --from=build --chown=node:node /app/build ./build
RUN mkdir -p /app/data

CMD ["node", "./build/src/main.js"]
