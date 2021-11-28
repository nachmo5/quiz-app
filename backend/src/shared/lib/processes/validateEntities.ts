import { Entity, Field, RelationField, ScalarField } from '../typings';
import { groupBy, isApiScalar, isDatabaseScalar } from '../helpers';

let validateEntity: (...args: any) => any;
let validateField: (...args: any) => any;

/*
  Entity -------------------------------------------
  - check if name is defined
  - check if entity has at least one field
  - check if entity has a primary key
  Field -------------------------------------------
  - if string check if scalar or entity
  - if object check if it has a type
  - if type is scalar, check if enum is good
  - if type is entity, check if it has a reference
  - check if reference points to a field

*/

export default (entities: Entity[]) => {
  const schema = groupBy(entities, 'name');
  try {
    entities.forEach((entity) => validateEntity(entity, schema));
  } catch (e: any) {
    throw new Error(`Schema validation error: ${e.message}`);
  }
};

// ------------------------------------------
// Helpers ----------------------------------
// ------------------------------------------

validateEntity = (entity: Entity, schema: Record<string, Entity>) => {
  if (!entity) {
    throw new Error('Null entity provided');
  }
  if (!entity.name) {
    throw new Error('Invalid entity, missing name');
  }
  const { fields = {} } = entity;
  if (Object.keys(fields).length === 0) {
    throw new Error(`Entity ${entity.name} must have at least one field`);
  }
  // Fields
  Object.keys(fields).forEach((fieldName) =>
    validateField(fieldName, fields[fieldName], entity.name, schema)
  );
  // Entity has to have a primary key
  /*
  let primaryKey = false;
  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];
    if (typeof field === 'string') return;
    if (field.primary) primaryKey = true;
  });
  if (!primaryKey) {
    throw new Error(`Entity ${entity.name} does not have a primary key`);
  }
  */
};

validateField = (
  name: string,
  params: Field | string,
  entityName: string,
  schema: Record<string, Entity>
) => {
  // null params_________________________
  if (!params) {
    throw new Error(`Null field params provided in entity ${entityName}`);
  }
  // String params_________________________
  if (typeof params === 'string') {
    if (!isApiScalar(params) && !isDatabaseScalar(params) && !schema[params]) {
      throw new Error(`Invalid value for field ${name} in entity ${entityName}`);
    } else return;
  }
  // Object params_________________________
  const field: Field = params as Field;
  // No field type
  if (!field.type) {
    throw new Error(`No type provided for field ${name} in entity ${entityName}`);
  }
  /* ==================== Scalar =================== */
  if (isApiScalar(field.type) || isDatabaseScalar(field.type)) {
    const enumValues = (field as ScalarField).enumValues;
    if (enumValues && !Array.isArray(enumValues)) {
      throw new Error('Invalid enum values, should be an array');
    }
  } else if (schema[field.type]) {
    /* ==================== RELATION =================== */
    const targetEntity = schema[field.type];
    const targetFieldName = (field as RelationField).reference;
    // No reference provided
    if (!targetFieldName) {
      throw new Error(
        `"reference" attribute was not provided for relation ${name} in entity ${entityName}`
      );
    }
    // Invalid reference provided (doesn't point to a field)
    const targetField = (targetEntity.fields || {})[targetFieldName];
    if (!targetField) {
      throw new Error(
        `Invalid "reference" provided in entity ${entityName}.${name}. field ${targetFieldName} does not exist in entity ${field.type}`
      );
    }
  } else {
    throw new Error(`Invalid type for field ${name} in entity ${entityName}`);
  }
};
