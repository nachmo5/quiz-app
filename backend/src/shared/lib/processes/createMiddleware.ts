import express from 'express';
import {
  Entity as ApiEntity,
  Field as ApiField,
  RequestDefinition as ApiRequestDefinition,
  ScalarEnum as ApiScalarEnum,
  Middleware as ApiMiddleware,
  Scalar as ApiScalar,
  HttpRequest,
  HttpResponse,
  NextFunction,
} from '../api';
import { FieldTypeEnum as DbScalarEnum } from '../orm';
import {
  ApplicationComponents,
  ApplicationConfig,
  Entity,
  Field,
  Services,
  RequestDefinition,
  HandleFunc,
  ScalarField,
  RelationField,
  Wrapper,
  Middleware,
} from '../typings';
import { processObject, isDatabaseScalar, groupBy, isApiScalar } from '../helpers';
import { getDefaultResolver, defaultWrapper } from '../defaults';
import createGraphqlMiddleware from '../api/ApiGateway';

let mapEntity: (...args: any) => any;
let mapField: (...args: any) => any;
let mapRequest: (...args: any) => any;
let mapMiddleware: (...args: any) => any;

export default (
  components: ApplicationComponents,
  services: Services,
  appConfig: ApplicationConfig
): ((req: express.Request, res: express.Response, next: NextFunction) => Promise<any> | void) => {
  // Prepare
  const { entities, requests = [], middlewares = [], wrapper = defaultWrapper } = components;
  const config = appConfig.api || {};
  const schema = groupBy(entities, 'name');
  // Map
  const apiEntities = entities.filter((e) => !e._noApi).map((e) => mapEntity(e, schema));
  const apiRequests = requests.map((request) => mapRequest(request, services, wrapper, schema));
  const apiMiddlewares = middlewares.map((middleware) => mapMiddleware(middleware, services));
  return createGraphqlMiddleware(
    { entities: apiEntities, requests: apiRequests, middlewares: apiMiddlewares },
    config
  );
};

// -------------------------------------
// Entity ------------------------------
// -------------------------------------

mapEntity = (entity: Entity, schema: Record<string, Entity>): ApiEntity => {
  const { name, fields = {} } = entity;
  const { _noOutput, _noData, _noFilter, _noOrderBy } = entity;
  const _generation = { _noOutput, _noData, _noFilter, _noOrderBy };
  const apiFields: ApiField[] = processObject(fields)
    // remove _noApi fields
    .filter((_, field) => typeof field === 'string' || !field._noApi)
    // map to api field
    .map((_, field) => mapField(_, field, schema))
    .collectValues();
  return { name, fields: apiFields, _generation };
};

mapField = (name: string, field: string | Field, schema: Record<string, Entity>): ApiField => {
  const dbScalarToApiScalar: Record<string, ApiScalar> = {
    // Int
    [DbScalarEnum.bigint]: ApiScalarEnum.int,
    [DbScalarEnum.integer]: ApiScalarEnum.int,
    [DbScalarEnum.int]: ApiScalarEnum.int,
    [DbScalarEnum.int8]: ApiScalarEnum.int,
    [DbScalarEnum.int4]: ApiScalarEnum.int,
    [DbScalarEnum.int2]: ApiScalarEnum.int,
    [DbScalarEnum.smallint]: ApiScalarEnum.int,
    // Float
    [DbScalarEnum.real]: ApiScalarEnum.float,
    [DbScalarEnum['double precision']]: ApiScalarEnum.float,
    [DbScalarEnum.float8]: ApiScalarEnum.float,
    [DbScalarEnum.decimal]: ApiScalarEnum.float,
    [DbScalarEnum.float4]: ApiScalarEnum.float,
    // JSON
    [DbScalarEnum.jsonb]: ApiScalarEnum.json,
    // Boolean
    [DbScalarEnum.bool]: ApiScalarEnum.boolean,
  };

  /* ================== STRING VALUE ====================== */
  if (typeof field === 'string') {
    // Database scalar ---------------------------------------
    if (isDatabaseScalar(field)) {
      return {
        name,
        type: dbScalarToApiScalar[field] || ApiScalarEnum.string,
      };
    }
    // Api scalar Or Entity (many to one)---------------------
    else return { name, type: field };
  }
  /* ================== Object VALUE ====================== */
  const { type, _noOutput, _noData, _noFilter, _noOrderBy } = field as Field;
  const { notNull, list, notEmpty } = field;

  const _generation = { _noOutput, _noData, _noFilter, _noOrderBy };
  const constraints = { notEmpty, notNull: notNull };
  // Scalar-----------------------
  if (isDatabaseScalar(type) || isApiScalar(type)) {
    const { enumValues } = field as ScalarField;
    const apiType = isDatabaseScalar(type)
      ? dbScalarToApiScalar[type] || ApiScalarEnum.string
      : type;
    return { name, type: apiType, enumValues, ...constraints, _generation, list };
  }
  // Entiy----------------------
  const { reference } = field as RelationField;
  const targetEntity = schema[type];
  const targetField = (targetEntity.fields || {})[reference];
  const targetFieldType = typeof targetField === 'string' ? targetField : targetField.type;
  // One to many: if the reference points to a field of type Entity
  if (schema[targetFieldType]) {
    return { name, type, ...constraints, _generation, list: true };
  }
  // Many to one: if the reference points to a scalar field
  else {
    return { name, type, ...constraints, _generation, list: false };
  }
};

// -------------------------------------
// Request -----------------------------
// -------------------------------------

mapRequest = (
  request: RequestDefinition,
  services: Services,
  wrapper: Wrapper,
  schema: Record<string, Entity>
): ApiRequestDefinition => {
  const { name, output, args, type, event = request.name, resolve } = request;
  const appResolve: HandleFunc = resolve || getDefaultResolver(event);
  const wrappedResolve = wrapper(appResolve, { name, output, args, type, event, schema });
  return {
    name,
    type,
    args,
    output,
    resolve: (args, output, context) => wrappedResolve({ args, output, context }, services),
  };
};

// -------------------------------------
// Middleware --------------------------
// -------------------------------------

mapMiddleware = (middleware: Middleware, services: Services): ApiMiddleware => ({
  ...middleware,
  process: (req: HttpRequest, res: HttpResponse, next: NextFunction) =>
    middleware.process(req, res, next, services),
});
