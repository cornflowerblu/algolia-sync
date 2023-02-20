FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm ci --no-audit
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "test:ci"]