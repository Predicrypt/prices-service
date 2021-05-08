FROM node:alpine

WORKDIR /app

ARG GITHUB_TOKEN

COPY .npmrc .npmrc 
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]