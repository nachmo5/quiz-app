import { ApplicationConfig, ApplicationComponents, Services } from './typings';
// Processes
import injectFields from './processes/injectFields';

import validateEntities from './processes/validateEntities';
import validateRequests from './processes/validateRequests';

import createMiddleware from './processes/createMiddleware';
import registerHandlers from './processes/registerHandlers';
import express, { NextFunction } from 'express';

export default class GraphqlMiddleware {
  create = (
    components: ApplicationComponents,
    config: ApplicationConfig = {}
  ): ((req: express.Request, res: express.Response, next: NextFunction) => Promise<any> | void) => {
    this.#validation(components);
    this.#injection(components, config);
    const services = this.#initServices(components);
    if (config.database !== false) registerHandlers(components, services);
    return createMiddleware(components, services, config);
  };

  // -------------------------------------
  // Sub methods -------------- -----------
  // -------------------------------------

  #injection = (components: ApplicationComponents, config: ApplicationConfig) => {
    const { entities = [], requests = [], handlers = [] } = components;
    const { injectedFields = {} } = config;
    // inject fields into entities
    if (injectedFields) {
      components.entities = injectFields(entities, injectedFields);
    }
    // inject crud requests into requests
    components.requests = [
      ...requests,
      {
        name: '_health',
        type: 'fetch',
        output: { type: 'boolean' },
        resolve: () => Promise.resolve(true),
      },
    ];
    // inject crud handlers into handlers
    components.handlers = [...handlers];
  };

  #validation = (components: ApplicationComponents) => {
    const { entities = [], requests = [] } = components;
    // validate entities
    validateEntities(entities);
    // validate requests
    validateRequests(requests, entities);
  };

  #initServices = (components: ApplicationComponents): Services => {
    const { services } = components;
    const { $bus, $database, $logger, ...rest } = services;
    return {
      $bus,
      $database,
      $logger: $logger || console,
      ...rest,
    };
  };
}
