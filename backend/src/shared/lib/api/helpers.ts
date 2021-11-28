import { ScalarEnum } from './enums';
import { NamingStrategy } from './typings';

export const isScalar = (type: string) => Object.keys(ScalarEnum).includes(type.toLowerCase());

export const groupBy = (array: Record<string, any>[], fieldName: string): Record<string, any> =>
  array.reduce((acc, field) => ({ ...acc, [field[fieldName]]: field }), {});

export const capitalize = (str: string) =>
  str && typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const _switch = (comparedValue: any, defaultValue: any, ...cases: any[][]) =>
  cases.reduce((acc, currentCase) => {
    const [value, result] = currentCase;
    if (value === comparedValue) return result;
    return acc;
  }, defaultValue);

export const randomNumber = (max: number, offset: number = 0) =>
  Math.floor(Math.random() * max) + offset;

export const defaultNamingStrategy: NamingStrategy = {
  getEntityOutput: (entityName: string) => entityName,
  getFilterInput: (entityName: string) => `${entityName}Filter`,
  getOrderByInput: (entityName: string) => `${entityName}OrderBy`,
  getDataInput: (entityName: string) => `${entityName}Data`,
  getPredicateInput: (name: string) => `${capitalize(name)}Predicate`,
  getEntityFieldsEnum: (entityName: string) => `${entityName}FieldsEnum`,
  getEnumField: (fieldName: string) => `${capitalize(fieldName)}Enum`,
};
