import { Entity, InjectedFields, ScalarField } from '../typings';
import { defaultInjectedFields } from '../defaults';

export default (entities: Entity[], injectedFields: InjectedFields): Entity[] =>
  entities.map((entity) => {
    if (entity._noDatabase) return entity;
    const {
      id = defaultInjectedFields.id,
      createdAt = defaultInjectedFields.createdAt,
      updatedAt = defaultInjectedFields.updatedAt,
    } = injectedFields;
    const fields: Record<string, ScalarField> = {};

    // no _noData for id because we're going to need it to link relations
    fields[(id || defaultInjectedFields.id) as string] = { type: 'varchar', primary: true };

    if (createdAt) {
      fields[createdAt] = { type: 'timestamptz', defaultValue: 'now()', _noData: true };
    }

    if (updatedAt) {
      fields[updatedAt] = { type: 'timestamptz', defaultValue: 'now()', _noData: true };
    }

    return { ...entity, fields: { ...fields, ...entity.fields } };
  });
