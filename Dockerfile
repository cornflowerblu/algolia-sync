## BUILDER IMAGE
FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY . .

RUN npm ci --no-audit
RUN npm run build
RUN npm prune --omit=dev

## PROD IMAGE
FROM node:lts-alpine as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 8080

CMD ["npm", "start"]