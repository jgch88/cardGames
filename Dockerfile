FROM node:8.12-alpine

COPY . /dockerapp

WORKDIR /dockerapp

RUN npm install
RUN npm run br

EXPOSE 4000

CMD ["npm", "start"]
