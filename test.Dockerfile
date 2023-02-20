FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm ci --no-audit
RUN npm run build

ENV NODE_ENV=development

EXPOSE 8080

ENTRYPOINT [ "./test/test.sh" ]