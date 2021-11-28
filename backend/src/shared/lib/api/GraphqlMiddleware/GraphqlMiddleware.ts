import { introspectionFromSchema, validate, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import graphqlMapper from './mapper';
import { groupBy } from '../helpers';
import { HttpMethodEnum, RequestTypeEnum, ScalarEnum } from '../enums';
import {
  Middleware,
  Schema,
  RequestApi,
  OutputField,
  OutputAst,
  HttpRequest,
  HttpResponse,
  NextFunction,
} from '../typings';
import GraphqlSchemaGenerator from './GraphqlSchemaGenerator';
import getPlaygroundMiddleware from './playground';
import project from './projection';

export default class GraphqlMiddleware {
  create = (
    schema: Schema,
    requests: RequestApi[]
  ): ((req: HttpRequest, res: HttpResponse, next: NextFunction) => Promise<any> | void) => {
    const graphqlSchema = new GraphqlSchemaGenerator().generate(schema, requests);
    const requestsMap = groupBy(
      [...requests, ...this.getIntrospectionRequests(graphqlSchema)],
      'name'
    );
    const outputSchema = groupBy(
      schema.outputs.map((output) => ({ ...output, fields: groupBy(output.fields, 'name') })),
      'name'
    );
    // Middleware
    return async (req, res) => {
      try {
        const { query, variables = {} } = req.body || {};
        /* ================ Parse ================== */
        const graphqlAst = gql(query);
        /* ================ Validate ================== */
        validate(graphqlSchema, graphqlAst);
        /* ================ Map ================== */
        const fieldAst: OutputField = graphqlMapper(graphqlAst, variables);
        /* ================ Resolve ================== */
        const request: RequestApi = requestsMap[fieldAst.name];
        if (!request) {
          throw { code: 'NO_RESOLVER', message: `request ${fieldAst.name} has no resolver` };
        }
        const { args, output, context } = this.getResolverParams(request, fieldAst, req);
        const result = await request.resolve(args, output, context);
        const projectedResult = project(result, request.output, fieldAst.fields, outputSchema);
        res.json({ data: { [request.name]: projectedResult } });
      } catch (e) {
        res.json({ errors: [this.createError(e)] });
      }
    };
  };

  getResolverParams = (request: RequestApi, fieldAst: OutputField, req: any) => {
    // Args
    const args = fieldAst.args || {};
    // Output
    const truncatedAst = this.truncateSpecialFields(fieldAst);
    const output: OutputAst = {
      type: request.output.name,
      fields: truncatedAst.fields || [],
    };
    // Context
    const context = { req, requestName: request.name };
    return { args, output, context };
  };
  playground = (graphql: string, playground: false | string): Middleware => {
    if (!playground) {
      return { process: (req, res, next) => next() };
    }
    return {
      route: playground as string,
      process: getPlaygroundMiddleware(graphql),
      method: HttpMethodEnum.get,
    };
  };

  createError = (e: any) => {
    console.log(new Date().toISOString() + ' [Graphql Error] ' + e.toString());
    console.log(e);
    let message: string;
    if (e instanceof Error || typeof e === 'object') {
      message = e.message;
    } else if (typeof e === 'string' || e instanceof String) {
      message = e as string;
    } else if (typeof e === 'number' || e instanceof Number) {
      message = e.toString();
    } else {
      message = e;
    }
    return {
      message,
      locations: e.locations || [],
      path: [],
      extensions: {
        code: e.code,
        timestamp: new Date().toISOString(),
      },
    };
  };

  getIntrospectionRequests = (graphqlSchema: GraphQLSchema): RequestApi[] => [
    {
      name: '__typename',
      type: RequestTypeEnum.fetch,
      args: [],
      output: { name: ScalarEnum.string },
      resolve: (args: Record<string, any>, f: OutputAst, context: Record<string, any>) =>
        Promise.resolve(
          context?.req?.body?.query?.definitions?.[0]?.operation === 'mutation'
            ? 'mutation_root'
            : 'query_root'
        ),
    },
    {
      name: '__schema',
      type: RequestTypeEnum.fetch,
      args: [],
      output: { name: ScalarEnum.json },
      resolve: async () => introspectionFromSchema(graphqlSchema).__schema,
    },
  ];

  truncateSpecialFields = (ast: OutputField): OutputField => {
    const { fields = [] } = ast;
    return {
      ...ast,
      fields: fields.reduce((facc: OutputField[], field) => {
        if (field.name.startsWith('__')) return facc;
        return [...facc, this.truncateSpecialFields(field)];
      }, []),
    };
  };
}
