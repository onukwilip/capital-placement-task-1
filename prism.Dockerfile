FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN npm i -g @stoplight/prism-cli

EXPOSE 4010

CMD ["npx", "prism", "mock", "./prism-demo.yaml"]