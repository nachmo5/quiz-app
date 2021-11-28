import { OutputField, SchemaAssignedType, SchemaField } from '../typings';
import { isScalar } from '../helpers';
/*
 This function will iterate over given fields, and project the result
 object into each of them
 it is primarely used to enforce output fields + resolve special fields like __typename
*/
const project = (
  result: any,
  type: SchemaAssignedType,
  fields: OutputField[] | undefined,
  schema: Record<string, { fields: Record<string, SchemaField> }>
): any => {
  if (type.list && !Array.isArray(result)) return [];
  /* ==================== Scalar ======================== */
  if (!fields || fields.length === 0 || isScalar(type.name)) return result;
  /* ==================== List ======================== */
  if (type.list) {
    return result.map((el: any) => project(el, { ...type, list: false }, fields, schema));
  }
  /* ==================== Object ======================== */
  if (result === null || result === undefined || typeof result !== 'object') return null;
  return fields.reduce((facc: Record<string, any>, field) => {
    // __ Typename field
    if (field.name === '__typename') return { ...facc, __typename: type.name };
    // Schema field
    const fieldType = schema?.[type.name]?.fields?.[field.name]?.type;
    if (!fieldType) {
      throw { code: 'INTERNAL_ERROR', message: `Field ${field.name} not found in schema` };
    }
    return {
      ...facc,
      [field.name]: project(
        result?.[field.name],
        schema[type.name].fields[field.name].type,
        field.fields || [],
        schema
      ),
    };
  }, {});
};

export default project;
