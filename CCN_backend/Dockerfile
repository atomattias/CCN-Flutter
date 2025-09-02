FROM node:18.06-slim

# WORKDIR ./

COPY . ./

RUN npm install

RUN npm run swagger && npm run build

EXPOSE 3000

CMD [ "npm run start" ]