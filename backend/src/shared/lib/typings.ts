import {
  OutputAst,
  RequestType,
  RequestArgument,
  RequestOutput,
  GenerationOption as ApiGenerationOptions,
  Scalar as ApiScalar,
  Constrainable as ApiConstraints,
  Middleware as ApiMiddleware,
  HttpRequest,
  HttpResponse,
  NextFunction,
  ApiGatewayConfig,
} from './api';
import {
  Constraints as DatabaseConstraints,
  FieldType as DatabaseScalar,
  Config as DatabaseConfig,
  Connection as DatabaseConnection,
  FloatOptions,
  DateTimeOptions,
  StringOptions,
} from './orm/typings';

export interface ApplicationComponents {
  entities: Entity[];
  requests?: RequestDefinition[];
  services: ServicesConfig;
  middlewares?: Middleware[];
  handlers?: Handler[];
  wrapper?: Wrapper;
}

export type Wrapper = (resolver: HandleFunc, metadata: RequestDefinition) => HandleFunc;

export interface ApplicationConfig {
  api?: false | ApiGatewayConfig;
  database?: false | DatabaseConfig;
  injectedFields?: InjectedFields;
  crudEvents?: CrudEvents;
}

export interface ServicesConfig extends Record<string, any> {
  $bus: Messagebroker;
  $database: DatabaseConnection;
  $logger?: any;
}

export interface Services extends Record<string, any> {
  $bus: Messagebroker;
  $database: DatabaseConnection;
  $logger: any;
}

export interface Middleware extends ApiMiddleware {
  process: (
    req: HttpRequest,
    res: HttpResponse,
    next: NextFunction,
    services?: Services
  ) => Promise<any> | void;
}
// -------------------------------------------
// Entities --------------------------------
// -------------------------------------------

export interface Entity extends RequestGenerationOptions, GenerationOptions {
  name: string;
  fields?: Record<string, string | ScalarField | RelationField>;
}

export interface Field extends GenerationOptions, DatabaseConstraints, ApiConstraints {
  type: string;
}

export interface ScalarField extends Field, FloatOptions, StringOptions, DateTimeOptions {
  type: ApiScalar | DatabaseScalar;
  enumValues?: string[];
}

export interface RelationField extends Field {
  type: string; // target Entity
  reference: string; // target field
}
// -------------------------------------------
// Requests ---------------------------------
// -------------------------------------------
export interface RequestDefinition extends Record<string, any> {
  // Required
  name: string;
  output: RequestOutput;
  // Optional
  args?: RequestArgument[];
  type?: string | RequestType;
  resolve?: HandleFunc;
  event?: string;
  handle?: (data: EventData, services: Services) => Promise<any>;
}

export interface InjectedFields {
  id?: string;
  createdAt?: false | string;
  updatedAt?: false | string;
}

export type HandleFunc = (data: EventData, services: Services) => Promise<any>;

// -------------------------------------------
// Handlers ----------------------------------
// -------------------------------------------
export interface Handler {
  handle: HandleFunc;
  event: string;
}

export interface EntityMetadata {
  primaryKey: string;
  name: string;
  fields: Record<string, FieldMetadata | RelationFieldMetadata>;
}

export interface FieldMetadata extends Record<string, string> {
  kind: 'scalar' | string;
  name: string;
}

export interface RelationFieldMetadata extends FieldMetadata {
  kind: 'manytoone' | 'onetomany';
  targetEntity: string;
  targetField: string;
}
// -------------------------------------------
// Generation --------------------------------
// -------------------------------------------
export interface GenerationOptions extends ApiGenerationOptions {
  _noApi?: boolean;
  _noDatabase?: boolean;
}

export interface RequestGenerationOptions {
  _noQueries?: boolean;
  _noMutations?: boolean;
  _noCreate?: boolean;
  _noUpdate?: boolean;
  _noDelete?: boolean;
  _noFetch?: boolean;
  _noAggregate?: boolean;
}

export interface CrudEvents {
  fetchOne: string;
  fetchMany: string;
  count: string;
  min: string;
  max: string;
  create: string;
  update: string;
  updateOne: string;
  delete: string;
}

// -------------------------------------------
// Security ----------------------------------
// -------------------------------------------
export type Authenticate = (
  data: EventData,
  services: Services,
  metadata: RequestDefinition
) => Promise<AuthenticatedUser>;

export interface AuthenticatedUser extends Record<string, any> {
  roles: string[];
}

export interface SecurityConfiguration {
  requests?: Record<string, string[]>;
  requestTypes?: Record<string | RequestType, string[]>;
  entities?: Record<string, Record<string | RequestType, string[]>>;
  fields?: Record<string, Record<string, Record<string | RequestType, string[]>>>;
  maxRecords?: number;
  maxLevels?: number;
}

// -------------------------------------------
// Message Broker ----------------------------
// -------------------------------------------
export interface Messagebroker {
  publish(event: string, data: EventData): Promise<any>;
  subscribe(event: string, subscriber: Subscriber): void;
}

export interface EventData extends Record<string, any> {
  args: Record<string, any>;
  output: OutputAst;
  context?: Record<string, any>;
}

export interface Subscriber {
  event: string;
  handle(data: EventData): Promise<unknown>;
}
