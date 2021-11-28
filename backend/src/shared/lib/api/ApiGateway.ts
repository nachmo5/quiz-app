import express, { NextFunction } from 'express';
import SchemaGenerator from './SchemaGenerator';
import RequestsGenerator from './RequestsGenerator';
import { ApiGatewayConfig, Components } from './typings';
import { defaultNamingStrategy } from './helpers';
// Middlewares
import GraphqlMiddleware from './GraphqlMiddleware';
const createGraphqlMiddleware = (
  components: Components,
  config: ApiGatewayConfig = {}
): ((req: express.Request, res: express.Response, next: NextFunction) => Promise<any> | void) => {
  const { entities, requests } = components;
  /* ==================== Generation ================ */
  const namingStrategy = { ...defaultNamingStrategy, ...(config.namingStrategy || {}) };
  const schema = new SchemaGenerator(namingStrategy).generate(entities);
  const apiRequests = new RequestsGenerator(namingStrategy).generate(requests);
  /* ==================== Create server ================ */
  return new GraphqlMiddleware().create(schema, apiRequests);
};

export default createGraphqlMiddleware;
