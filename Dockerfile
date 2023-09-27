FROM node:gallium-alpine

WORKDIR /app

COPY ./package.json .

RUN npm install -f

COPY . .

RUN npm i -g @stoplight/prism-cli

RUN npm i -g serve

ENV API_GET_ENDPOINT="http://localhost:4010/api/v1/programs/prince-project/application-form"

ENV API_PUT_ENDPOINT="http://localhost:4010/api/v1/programs/prince-project/application-form"

RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build"]