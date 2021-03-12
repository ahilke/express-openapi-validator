import { expect } from 'chai';
import * as express from 'express';
import * as request from 'supertest';
import * as packageJson from '../package.json';
import { OpenAPIV3 } from '../src/framework/types';
import { createApp } from './common/app';

describe(packageJson.name, () => {
  let app = null;

  before(async () => {
    app = await createApp({ apiSpec: createApiSpec() }, 3001, (app) =>
      app.use(
        app.basePath,
        express
          .Router()
          .get(`/pets`, () => ['cat', 'dog'])
          .post(`/pets`, (req, res) => res.json(req.body)),
      ),
    );
  });

  after(() => {
    app.server.close();
  });

  it('adds allow header to 405 - Method Not Allowed', async () =>
    request(app)
      .put('/pets')
      .expect(405)
      .then((response) => {
        expect(response.header).to.include({ allow: 'GET, POST' });
      }));
});

function createApiSpec(): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Petstore API',
      version: '1.0.0',
    },
    paths: {
      '/pets': {
        get: {
          responses: {
            '200': { description: 'GET Pet' },
          },
        },
        post: {
          responses: {
            '200': { description: 'POST Pet' },
          },
        },
      },
    },
  };
}
