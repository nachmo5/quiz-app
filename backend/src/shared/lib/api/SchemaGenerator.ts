import {
  Entity,
  Field,
  NamingStrategy,
  Schema,
  SchemaType,
  SchemaEnum,
  SchemaField,
} from './typings';
import { isScalar } from './helpers';
import { ScalarEnum } from './enums';

export default class SchemaGenerator {
  $namingStrategy: NamingStrategy;

  constructor(namingStrategy: NamingStrategy) {
    this.$namingStrategy = namingStrategy;
  }

  generate = (entities: Entity[]): Schema => {
    const schema: Schema = {
      inputs: [...this.getDefaultPredicates()],
      outputs: [],
      enums: [this.getOrderByEnum()],
      scalars: this.getDefaultScalars(),
    };
    // Schema entities Generated from custom entities
    entities.forEach((entity: Entity) => {
      const { _generation = {} } = entity;
      /* ================= Output ===================== */
      if (!_generation._noOutput) schema.outputs.push(this.generateOutput(entity));
      /* ================= Input Data ================ */
      if (!_generation._noData) schema.inputs.push(this.generateDataInput(entity));
      /* ================= Input Filter ================ */
      if (!_generation._noFilter) schema.inputs.push(this.generateFilterInput(entity));
      /* ================= Input OrderBy ================ */
      if (!_generation._noOrderBy) schema.inputs.push(this.generateOrderByInput(entity));
      /* ==================== Enums ===================== */
      const generatedEnums = this.generateEnums(entity);
      schema.enums = [...schema.enums, ...generatedEnums];
      schema.inputs = [...schema.inputs, ...this.generateEnumPredicates(generatedEnums)];
    });
    return schema;
  };

  // ------------------------------------------
  // Output -----------------------------------
  // ------------------------------------------

  generateOutput = (entity: Entity): SchemaType => {
    const { fields = [], name } = entity;
    const schemaFields: SchemaField[] = fields
      .filter((field) => !(field._generation || {})._noOutput)
      .map(this.generateOutputField);
    return {
      name: this.$namingStrategy.getEntityOutput(name),
      fields: schemaFields,
    };
  };

  generateOutputField = (field: Field): SchemaField => {
    const { name, type, notEmpty = false, notNull = false, list = false, enumValues } = field;
    const schemaField = {
      name,
      type: { name: type, notNull, list, notEmpty },
    };
    // enum case
    if (enumValues) {
      schemaField.type.name = this.$namingStrategy.getEnumField(name);
      return schemaField;
    }
    // one to many case
    if (!isScalar(type) && list) {
      return {
        ...schemaField,
        args: [
          { name: 'limit', type: { name: ScalarEnum.int } },
          { name: 'offset', type: { name: ScalarEnum.int } },
          {
            name: 'orderBy',
            type: { name: this.$namingStrategy.getOrderByInput(type) },
          },
          { name: 'where', type: { name: this.$namingStrategy.getFilterInput(type) } },
        ],
      };
    }
    return schemaField;
  };

  // ------------------------------------------
  // Enums ------------------------------------
  // ------------------------------------------
  generateEnums = (entity: Entity): SchemaEnum[] => {
    const { name, fields = [] } = entity;
    // All Entity Fields Enum
    const fieldsEnumName = this.$namingStrategy.getEntityFieldsEnum(name);
    const typeFieldsEnum = {
      name: fieldsEnumName,
      values: fields.map((field) => field.name),
    };
    // Fields with enum constraint
    const enumFields = fields
      .filter((field) => !!field.enumValues)
      .map((field) => ({
        name: this.$namingStrategy.getEnumField(field.name),
        values: field.enumValues || [],
      }));
    return [...enumFields, typeFieldsEnum];
  };

  generateEnumPredicates = (schemaEnums: SchemaEnum[]): SchemaType[] =>
    schemaEnums.map((schemaEnum) => {
      const predicateName = this.$namingStrategy.getPredicateInput(schemaEnum.name);
      const fields = [
        { name: '_eq', type: { name: schemaEnum.name } },
        { name: '_neq', type: { name: schemaEnum.name } },
        { name: '_in', type: { name: schemaEnum.name, list: true, notEmpty: true } },
        { name: '_nin', type: { name: schemaEnum.name, list: true, notEmpty: true } },
        { name: '_isnull', type: { name: ScalarEnum.boolean } },
      ];
      return {
        name: predicateName,
        fields,
      };
    });

  // ------------------------------------------
  //  Data Input-------------------------------
  // ------------------------------------------
  generateDataInput = (entity: Entity): SchemaType => {
    const { fields = [], name } = entity;
    const schemaFields: SchemaField[] = fields
      .filter((field) => !(field._generation || {})._noData)
      .map(this.generateDataInputField);
    return {
      name: this.$namingStrategy.getDataInput(name),
      fields: schemaFields,
    };
  };

  generateDataInputField = (field: Field): SchemaField => {
    const { name, type, notNull = false, notEmpty = false, list = false, enumValues } = field;
    /* Type depends on the scenario */
    let schemaFieldType: string;
    // enums
    if (enumValues) schemaFieldType = this.$namingStrategy.getEnumField(name);
    // scalar
    else if (isScalar(type)) schemaFieldType = type;
    // target entity
    else schemaFieldType = this.$namingStrategy.getDataInput(type);
    return { name, type: { name: schemaFieldType, list, notEmpty, notNull } };
  };
  // ------------------------------------------
  //  Filter Input ----------------------------
  // ------------------------------------------
  generateFilterInput = (entity: Entity): SchemaType => {
    const { fields = [], name } = entity;
    const schemaEntityName = this.$namingStrategy.getFilterInput(name);
    const schemaFields: SchemaField[] = fields
      .filter((field) => !(field._generation || {})._noFilter)
      .map(this.generateFilterInputField);

    const logicFields = [
      { name: '_and', type: { name: schemaEntityName, list: true } },
      { name: '_or', type: { name: schemaEntityName, list: true } },
    ];

    return {
      name: schemaEntityName,
      fields: [...schemaFields, ...logicFields],
    };
  };

  generateFilterInputField = (field: Field): SchemaField => {
    const { name, type, enumValues } = field;
    /* Type depends on the scenario */
    let schemaFieldType: string;
    // enums
    if (enumValues) {
      schemaFieldType = this.$namingStrategy.getPredicateInput(
        this.$namingStrategy.getEnumField(name)
      );
    }
    // scalar
    else if (isScalar(type)) schemaFieldType = this.$namingStrategy.getPredicateInput(type);
    // target entity
    else schemaFieldType = this.$namingStrategy.getFilterInput(type);
    return { name, type: { name: schemaFieldType } };
  };

  // ------------------------------------------
  //  Order by Input ----------------------------
  // ------------------------------------------
  generateOrderByInput = (entity: Entity): SchemaType => {
    const { fields = [], name } = entity;
    const schemaEntityName = this.$namingStrategy.getOrderByInput(name);
    const schemaFields: SchemaField[] = fields
      .filter((field) => !(field._generation || {})._noOrderBy)
      .map(this.generateOrderByInputField);

    return { name: schemaEntityName, fields: schemaFields };
  };

  generateOrderByInputField = (field: Field): SchemaField => {
    const { name, type, enumValues } = field;
    return {
      name,
      type: {
        name:
          isScalar(type) || enumValues
            ? this.getOrderByEnum().name
            : this.$namingStrategy.getOrderByInput(type),
      },
    };
  };
  // ------------------------------------------
  // DEFAULT SCHEMA ENTITIES ------------------
  // ------------------------------------------

  getOrderByEnum = () => ({
    name: this.$namingStrategy.getEnumField('orderBy'),
    values: ['ASC', 'DESC'],
  });

  getDefaultScalars = () => Object.keys(ScalarEnum);

  getDefaultPredicates = (): SchemaType[] =>
    [
      {
        name: this.$namingStrategy.getPredicateInput(ScalarEnum.string),
        fields: [
          { name: '_eq', type: ScalarEnum.string },
          { name: '_neq', type: ScalarEnum.string },
          { name: '_like', type: ScalarEnum.string },
          { name: '_ilike', type: ScalarEnum.string },
          { name: '_nlike', type: ScalarEnum.string },
          { name: '_in', type: ScalarEnum.string, list: true, notEmpty: true },
          { name: '_nin', type: ScalarEnum.string, list: true, notEmpty: true },
          { name: '_gt', type: ScalarEnum.string },
          { name: '_gte', type: ScalarEnum.string },
          { name: '_lt', type: ScalarEnum.string },
          { name: '_lte', type: ScalarEnum.string },
          { name: '_isnull', type: ScalarEnum.boolean },
        ],
      },
      {
        name: this.$namingStrategy.getPredicateInput(ScalarEnum.int),
        fields: [
          { name: '_eq', type: ScalarEnum.int },
          { name: '_neq', type: ScalarEnum.int },
          { name: '_in', type: ScalarEnum.int, list: true, notEmpty: true },
          { name: '_nin', type: ScalarEnum.int, list: true, notEmpty: true },
          { name: '_gt', type: ScalarEnum.int },
          { name: '_gte', type: ScalarEnum.int },
          { name: '_lt', type: ScalarEnum.int },
          { name: '_lte', type: ScalarEnum.int },
          { name: '_isnull', type: ScalarEnum.boolean },
        ],
      },
      {
        name: this.$namingStrategy.getPredicateInput(ScalarEnum.float),
        fields: [
          { name: '_eq', type: ScalarEnum.float },
          { name: '_neq', type: ScalarEnum.float },
          { name: '_in', type: ScalarEnum.float, list: true, notEmpty: true },
          { name: '_nin', type: ScalarEnum.float, list: true, notEmpty: true },
          { name: '_gt', type: ScalarEnum.float },
          { name: '_gte', type: ScalarEnum.float },
          { name: '_lt', type: ScalarEnum.float },
          { name: '_lte', type: ScalarEnum.float },
          { name: '_isnull', type: ScalarEnum.boolean },
        ],
      },
      {
        name: this.$namingStrategy.getPredicateInput(ScalarEnum.boolean),
        fields: [
          { name: '_eq', type: ScalarEnum.boolean },
          { name: '_neq', type: ScalarEnum.boolean },
          { name: '_isnull', type: ScalarEnum.boolean },
        ],
      },
      {
        name: this.$namingStrategy.getPredicateInput(ScalarEnum.json),
        fields: [
          { name: '_eq', type: ScalarEnum.json },
          { name: '_neq', type: ScalarEnum.json },
          { name: '_like', type: ScalarEnum.json },
          { name: '_nlike', type: ScalarEnum.json },
          { name: '_in', type: ScalarEnum.json, list: true, notEmpty: true },
          { name: '_nin', type: ScalarEnum.json, list: true, notEmpty: true },
          { name: '_isnull', type: ScalarEnum.boolean },
        ],
      },
    ].map((predicate) => ({
      ...predicate,
      fields: predicate.fields.map((field) => ({
        name: field.name,
        type: { name: field.type, list: field.list, notEmpty: field.notEmpty },
      })),
    }));
}
