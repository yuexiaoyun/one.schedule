FROM node:8.5-alpine
RUN npm config set registry https://registry.npm.taobao.org
WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install --production
COPY . .
ENV EGG_SERVER_ENV=prod
EXPOSE 8080
CMD npm start