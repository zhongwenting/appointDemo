FROM node:8-alpine

RUN mkdir -p /app/webapp

WORKDIR /app/webapp

COPY . /app/webapp

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install

EXPOSE 3000

CMD ["npm","start"]