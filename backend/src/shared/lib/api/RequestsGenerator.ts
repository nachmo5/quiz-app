import { InputCategoryEnum, RequestTypeEnum } from './enums';
import { _switch } from './helpers';
import {
  RequestArgument,
  RequestDefinition,
  SchemaArgument,
  RequestApi,
  RequestOutput,
  SchemaAssignedType,
  NamingStrategy,
} from './typings';

export default class RequestGenerator {
  $namingStrategy: NamingStrategy;

  constructor(namingStrategy: NamingStrategy) {
    this.$namingStrategy = namingStrategy;
  }

  generate = (requests: RequestDefinition[]): RequestApi[] => requests.map(this.generateRequest);

  generateRequest = (request: RequestDefinition): RequestApi => {
    const { name, type, args, output, resolve } = request;
    return {
      name,
      type: type || RequestTypeEnum.update,
      args: (args || []).map(this.generateArgument),
      output: this.generateOutput(output),
      resolve,
    };
  };

  generateArgument = (requestArgument: RequestArgument): SchemaArgument => {
    const { name, type, category, list, notEmpty, notNull } = requestArgument;
    const argTypeName = _switch(
      category,
      type,
      [InputCategoryEnum.filter, this.$namingStrategy.getFilterInput(type)],
      [InputCategoryEnum.orderby, this.$namingStrategy.getOrderByInput(type)],
      [InputCategoryEnum.predicate, this.$namingStrategy.getPredicateInput(type)],
      [InputCategoryEnum.data, this.$namingStrategy.getDataInput(type)],
      [InputCategoryEnum.field, this.$namingStrategy.getEntityFieldsEnum(type)]
    );
    return {
      name,
      type: {
        name: argTypeName,
        list,
        notEmpty,
        notNull,
      },
    };
  };

  generateOutput = (requestOutput: RequestOutput): SchemaAssignedType => {
    const { type, list, notEmpty, notNull } = requestOutput;
    return { name: this.$namingStrategy.getEntityOutput(type), list, notEmpty, notNull };
  };
}
