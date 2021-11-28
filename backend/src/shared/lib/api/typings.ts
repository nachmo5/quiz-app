import { CompressionOptions } from 'compression';
import express from 'express';
import { CorsOptions } from 'cors';
import { HttpMethodEnum, InputCategoryEnum, RequestTypeEnum, ScalarEnum } from './enums';

export interface Components {
  entities: Entity[];
  requests: RequestDefinition[];
  middlewares?: Middleware[];
}

export interface ApiGatewayConfig {
  port?: number;
  // Query languages
  jsonql?: false | string;
  graphql?: false | string;
  // middlewares
  playground?: false | string;
  compression?: false | CompressionOptions;
  methodOverride?: false | string | ((req: express.Request, res: express.Response) => string);
  helmet?: boolean;
  cors?: false | CorsOptions;
  // Generation
  namingStrategy?: NamingStrategy;
}

export interface Constrainable {
  list?: boolean;
  notEmpty?: boolean;
  notNull?: boolean;
}

// ------------------------------------------
// Middleware   -----------------------------
// ------------------------------------------

export interface HttpRequest extends express.Request {}
export interface HttpResponse extends express.Response {}
export interface NextFunction extends express.NextFunction {}

export interface Middleware {
  route?: string;
  method?: HttpMethod;
  process: (req: HttpRequest, res: HttpResponse, next: NextFunction) => Promise<any> | void;
}

// ------------------------------------------
// Schema       -----------------------------
// ------------------------------------------
export interface Schema {
  inputs: SchemaType[];
  outputs: SchemaType[];
  enums: SchemaEnum[];
  scalars: string[];
}

export interface SchemaType {
  name: string;
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: SchemaAssignedType;
  args?: SchemaArgument[];
}

export interface SchemaAssignedType extends Constrainable {
  name: string; // Scalar | SchemaType.name
}

export interface SchemaArgument {
  name: string;
  type: SchemaAssignedType;
}

export interface SchemaEnum {
  name: string;
  values: string[];
}

export interface RequestApi {
  name: string;
  type: string | 'CREATE' | 'UPDATE' | 'DELETE' | 'FETCH';
  args: SchemaArgument[];
  output: SchemaAssignedType;
  resolve: Resolver;
}

// ------------------------------------------
// User provided Types    -------------------
// ------------------------------------------

export interface Entity {
  name: string;
  fields?: Field[];
  _generation?: GenerationOption;
}

export interface Field extends Constrainable {
  name: string;
  type: Scalar | string;
  enumValues?: string[];
  _generation?: GenerationOption;
}

// ------------------------------------------
// Request      -----------------------------
// ------------------------------------------
export interface RequestDefinition {
  name: string;
  type?: string | RequestType;
  args?: RequestArgument[];
  output: RequestOutput;
  resolve: Resolver;
}

export interface RequestArgument extends Constrainable {
  name: string;
  type: string | Scalar;
  category?: InputCategory;
}
export interface RequestOutput extends Constrainable {
  type: string | Scalar;
}

export interface OutputAst {
  type: string;
  fields?: OutputField[];
}

export interface OutputField {
  name: string;
  args?: Record<string, any>;
  fields?: OutputField[];
}

export type Resolver = (
  args: Record<string, any>,
  ast: OutputAst,
  context: Record<string, any>
) => Promise<any>;
// ------------------------------------------
// Generation      --------------------------
// ------------------------------------------
export interface GenerationOption {
  _noOutput?: boolean;
  _noData?: boolean;
  _noFilter?: boolean;
  _noOrderBy?: boolean;
}

export interface NamingStrategy {
  getEntityOutput: (entityName: string) => string;
  getFilterInput: (entityName: string) => string;
  getOrderByInput: (entityName: string) => string;
  getDataInput: (entityName: string) => string;
  getPredicateInput: (entityName: string) => string;
  getEntityFieldsEnum: (entityName: string) => string;
  getEnumField: (fieldName: string) => string;
}
// Scalars
export type Scalar = keyof typeof ScalarEnum;
export type InputCategory = keyof typeof InputCategoryEnum;
export type RequestType = keyof typeof RequestTypeEnum;
export type HttpMethod = keyof typeof HttpMethodEnum;
