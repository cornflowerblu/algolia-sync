FROM alpine:latest

WORKDIR /usr/src/app

COPY . .

RUN apk update
RUN apk add npm bash openrc python3 docker docker-compose
RUN rc-update add docker default

RUN npm ci --no-audit
RUN npm run build

RUN /etc/init.d/docker start

ENV NODE_ENV=development

EXPOSE 8080

ENTRYPOINT [ "./test/test.sh" ]