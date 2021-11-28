import { RequestDefinition, Entity } from '../typings';
import { groupBy, isApiScalar } from '../helpers';
import { RequestArgument, RequestOutput } from '../api';

let validateRequest: (...args: any) => any;
let validateRequestOutput: (...args: any) => any;
let validateRequestArgument: (...args: any) => any;

export default (requests: RequestDefinition[], entities: Entity[]) => {
  const schema = groupBy(entities, 'name');
  requests.forEach((request) => validateRequest(request, schema));
};

// Helpers
validateRequest = (request: RequestDefinition, schema: Record<string, Entity>) => {
  const { name, args = [], output, handle } = request;
  try {
    if (!name) throw new Error('Missing name');
    if (!output) throw new Error('Missing output');
    // if (!handle || typeof handle !== 'function') throw new Error('Missing handle function');

    validateRequestOutput(output, schema);
    if (!Array.isArray(args)) throw new Error('args is not an array');
    args.forEach((arg) => validateRequestArgument(arg, schema));
  } catch (e: any) {
    throw new Error(`Bad definition for request ${name}. ${e.message}`);
  }
};

validateRequestOutput = (output: RequestOutput, schema: Record<string, Entity>) => {
  if (typeof output !== 'object') throw new Error('Output should be an object');
  const { type } = output;
  try {
    if (!type) throw new Error(`Missing type attribute`);
    if (isApiScalar(type)) return;

    const targetEntity = schema[type];
    if (!targetEntity) {
      throw new Error(`"Invalid type attribute. ${type} is not a scalar nor an entity`);
    }
  } catch (e: any) {
    throw new Error('Invalid output. ' + e.message);
  }
};

validateRequestArgument = (requestArg: RequestArgument, schema: Record<string, Entity>) => {
  if (typeof requestArg !== 'object') throw new Error('Argument should be an object');
  const { name, type, category } = requestArg;
  try {
    if (!name) throw new Error('Missing name attribute');
    if (!type) throw new Error('Missing type attribute');

    if (isApiScalar(type)) return;
    if (!category) throw new Error('Non scalar arguments should have category (data|filter...)');

    const targetEntity = schema[type];
    if (!targetEntity) {
      throw new Error(`"Invalid type attribute. ${type} is not a scalar nor an entity`);
    }
  } catch (e: any) {
    throw new Error('Invalid argument. ' + e.message);
  }
};
