import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'CCN',
    description: 'CCN Chat API'
  },
  host: 'localhost:3000',
  tags: [
    {
      name: 'user',
      description: 'auth enpoints'
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      }
    }
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
      },
    },
  },
};

const outputFile = '../src/doc.json';
const routes = ['./app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);