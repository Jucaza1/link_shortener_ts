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
WORKDIR /app
COPY package.json package-lock.json .
RUN npm install --only=production
COPY --from=build /app/build ./build

CMD ["node", "./build/src/main.js"]
