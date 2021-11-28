import { buildSchema, GraphQLSchema, validateSchema } from 'graphql';
import { RequestTypeEnum } from '../enums';
import { capitalize } from '../helpers';
import { Schema, SchemaType, SchemaEnum, SchemaField, RequestApi } from '../typings';

export default class GraphqlSchemaGenerator {
  scalarMap: Record<string, string> = {};
  generate(schema: Schema, requests: RequestApi[]): GraphQLSchema {
    const { inputs, outputs, enums, scalars } = schema;
    this.scalarMap = this.mapScalars(scalars);
    const graphqlScalars = Object.keys(this.scalarMap)
      .filter((scalar) => !this.isGraphqlBasicType(scalar))
      .map(this.generateGraphqlScalar)
      .join('\n  ');
    const graphqlTypes = outputs.map(this.generateGraphqlType).join('\n');
    const graphqlInputs = inputs.map(this.generateGraphqlInput).join('\n');
    const graphqlEnums = enums.map(this.generateGraphqlEnum).join('\n');

    const queries = requests
      .filter((req) => req.type.toLowerCase() === RequestTypeEnum.fetch)
      .map(this.requestToField)
      .map(this.generateGraphqlField);
    const mutations = requests
      .filter((req) => req.type.toLowerCase() !== RequestTypeEnum.fetch)
      .map(this.requestToField)
      .map(this.generateGraphqlField);

    const schemaElements = [];
    schemaElements.push(graphqlTypes);
    schemaElements.push(graphqlInputs);
    schemaElements.push(graphqlEnums);
    schemaElements.push(graphqlScalars);
    if (queries.length > 0) schemaElements.push(`type Query{\n  ${queries}\n}`);
    if (mutations.length > 0) schemaElements.push(`type Mutation{\n  ${mutations}\n}`);

    const strSchema = schemaElements.join('\n');
    try {
      const gqlSchema = buildSchema(strSchema);
      const errors = validateSchema(gqlSchema);
      if (errors.length > 0) throw new Error(errors.toString());
      return gqlSchema;
    } catch (e: any) {
      console.log(strSchema);
      throw new Error(e);
    }
  }

  generateGraphqlType = (type: SchemaType): string =>
    `type ${type.name} {\n  ${type.fields.map(this.generateGraphqlField).join('\n  ')}\n}`;

  generateGraphqlInput = (type: SchemaType): string =>
    `input ${type.name} {\n  ${type.fields.map(this.generateGraphqlField).join('\n  ')}\n}`;

  generateGraphqlEnum = (type: SchemaEnum): string =>
    `enum ${type.name} {\n  ${type.values.join('\n  ')}\n}`;

  generateGraphqlScalar = (type: string): string => `scalar ${capitalize(type)}`;

  generateGraphqlField = (field: SchemaField) => {
    let graphqlField = `${field.name}`;
    if (field.args && field.args.length > 0) {
      graphqlField += `(${field.args.map(this.generateGraphqlField).join(', ')})`;
    }

    let graphqlType = `${this.scalarMap[field.type.name] || field.type.name}`;
    if (field.type.list && field.type.notEmpty) {
      graphqlType = `${graphqlType}!`;
    }
    if (field.type.list) {
      graphqlType = `[${graphqlType}]`;
    }
    if (field.type.notNull) {
      graphqlType = `${graphqlType}!`;
    }
    return `${graphqlField}: ${graphqlType}`;
  };

  requestToField = (request: RequestApi) => ({
    name: request.name,
    type: request.output,
    args: request.args,
  });

  /* ========================= HELPERS ================= */
  isGraphqlBasicType = (t: string) => ['string', 'int', 'boolean', 'float'].includes(t);

  // gql wants to
  // 1. prevent string int boolean float from being created in SCALARS
  // 2. replace string int boolean float with their gql counter parts
  // 3. rest of the scalars should be capitalized
  mapScalars = (scalars: string[]): Record<string, string> =>
    scalars.reduce((acc, s) => {
      let newValue: string;
      if (s === 'string') newValue = 'String';
      if (s === 'int') newValue = 'Int';
      if (s === 'boolean') newValue = 'Boolean';
      if (s === 'float') newValue = 'Float';
      newValue = capitalize(s);
      return { ...acc, [s]: newValue };
    }, {});
}
