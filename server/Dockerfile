FROM node:alpine
WORKDIR /server
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN apk add npm
RUN npm i
EXPOSE 5000
CMD ["npm", "run", "start"]