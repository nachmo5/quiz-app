import { ScalarEnum as ApiScalarEnum } from './api';
import { FieldTypeEnum as DatabaseScalarEnum } from './orm';
import { Entity, Field, RelationField } from './typings';

export const isApiScalar = (type: string): boolean =>
  Object.keys(ApiScalarEnum).includes(type.toLowerCase());

export const isDatabaseScalar = (type: string): boolean =>
  Object.keys(DatabaseScalarEnum).includes(type.toLowerCase());

export const isManyToOne = (field: string | Field, schema: Record<string, Entity>): boolean => {
  if (typeof field === 'string') return !!schema[field];
  if (!schema[field.type]) return false;
  const { type, reference } = field as RelationField;
  const targetEntity = schema[type];
  const targetField = (targetEntity.fields || {})[reference];
  const targetFieldType = typeof targetField === 'string' ? targetField : targetField.type;
  return !schema[targetFieldType];
};

export const findPrimaryKey = (entity: Entity): string =>
  Object.keys(entity.fields || {}).reduce((facc: any, fieldName) => {
    const field = entity.fields?.[fieldName];
    if (typeof field !== 'object') return facc;
    if ((field as Field).primary) return fieldName;
    return facc;
  }, '');

// --------------------------------------------
// Object helpers -----------------------------
// --------------------------------------------
export const filterObject = <T>(
  object: Record<string, T>,
  callback: (key: string, value: T) => boolean
) =>
  Object.keys(object).reduce((acc, key) => {
    const value = object[key];
    return callback(key, value) ? { ...acc, [key]: value } : acc;
  }, {});

export const mapObject = (
  object: Record<string, any>,
  callback: (key: string, value: any) => any
): Record<string, any> =>
  Object.keys(object).reduce((acc: Record<string, any>, key: string) => {
    return { ...acc, [key]: callback(key, object[key]) };
  }, {});

export const processObject = <T>(object: Record<string, T>) => {
  let acc = object;
  const process = {
    map: (cb: (key: string, value: T) => any) => {
      acc = mapObject(acc, cb);
      return process;
    },
    filter: (cb: (key: string, value: T) => boolean) => {
      acc = filterObject(acc, cb);
      return process;
    },
    collect: (): any => acc,
    collectValues: (): any => Object.values(acc || {}),
  };
  return process;
};

// --------------------------------------------
// Array helpers ------------------------------
// --------------------------------------------
export const groupBy = (array: Record<string, any>[], fieldName: string): Record<string, any> =>
  array.reduce((acc, field) => ({ ...acc, [field[fieldName]]: field }), {});
{
}
export const append = (arr1: any[], arr2: any[]) => arr2.forEach((el) => arr1.push(el));

export const seqAsync = (arr: any[], cb: (e: any) => Promise<any>) =>
  arr.reduce((acc: Promise<any>, f) => acc.then(() => cb(f)), Promise.resolve(true));
