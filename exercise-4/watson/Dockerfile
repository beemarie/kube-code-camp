FROM node:9.4.0-alpine

ADD config /app/config
ADD public /app/public
ADD views /app/views

ADD server.js /app
ADD voices.js /app
ADD app.js /app
ADD casper-runner.js /app
ADD package.json /app

RUN cd /app; npm install

EXPOSE  8080
WORKDIR "/app"
CMD npm start
