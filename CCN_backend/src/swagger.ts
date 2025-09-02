import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'CCN',
    description: 'CCN Chat API'
  },
  host: 'localhost:3000'
};

const outputFile = '../src/doc.json';
const routes = ['./routes/authRoutes.js'];

swaggerAutogen()(outputFile, routes, doc);