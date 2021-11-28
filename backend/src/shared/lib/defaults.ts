import { InjectedFields, HandleFunc, Entity } from './typings';
import {
  Connection,
  DeleteQueryArgs,
  InsertQueryArgs,
  OutputAst,
  Predicate,
  Query,
  UpdateQueryArgs,
  WhereAst,
} from './orm/typings';
import { findPrimaryKey } from './helpers';

export const defaultInjectedFields: InjectedFields = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export const getDefaultResolver =
  (event: string): HandleFunc =>
  (data, { $bus }) => {
    const { args = {}, output, context } = data;
    const { req, ...rest } = context || {};
    return $bus.publish(event, { args, output, context: rest });
  };

export const defaultWrapper = (resolve: HandleFunc): HandleFunc => resolve;

/*
======================================================
============== In-Memory Database ====================
======================================================
*/

export class InMemoryDatabase implements Connection {
  database: Record<string, any[]> = {};
  primaryKeyByEntity: Record<string, string> = {};

  constructor(entities: Entity[]) {
    // init tables
    entities.forEach((entity) => (this.database[entity.name] = []));
    // primary keys
    this.primaryKeyByEntity = entities.reduce((acc, entity) => {
      const primaryKey: string = findPrimaryKey(entity);
      return { ...acc, [entity.name]: primaryKey };
    }, {});
  }

  select = (entityName: string, ast: OutputAst) =>
    Promise.resolve({ [ast.name]: this.database[entityName] });

  selectOne = (entityName: string, ast: OutputAst) => {
    const { args = {} } = ast;
    const searchedId = (args?.where?.[this.primaryKeyByEntity[entityName]] as Predicate)?._eq;
    const result = this.database[entityName].find(
      (row) => row[this.primaryKeyByEntity[entityName]] === searchedId
    );
    return Promise.resolve({ [ast.name]: result });
  };
  aggregate = (entityName: string) => Promise.resolve(this.database[entityName].length);

  insert = (entityName: string, data: Record<string, any>) => {
    this.database[entityName].push(data);
    return Promise.resolve(data);
  };
  update = (entityName: string, data: Record<string, any>, where: WhereAst) => {
    const searchedId = (where?.[this.primaryKeyByEntity[entityName]] as Predicate)?._eq;
    let result;
    const rows = this.database[entityName].map((row) => {
      if (row[this.primaryKeyByEntity[entityName]] === searchedId) {
        result = { ...row, ...data };
        return result;
      }
      return row;
    });
    this.database[entityName] = rows;
    return Promise.resolve(result);
  };
  delete = (entityName: string, where: WhereAst) => {
    const searchedId = (where?.[this.primaryKeyByEntity[entityName]] as Predicate)?._eq;
    let result;
    const rows = this.database[entityName].filter((row) => {
      if (row[this.primaryKeyByEntity[entityName]] === searchedId) {
        result = row;
        return false;
      }
      return true;
    });
    this.database[entityName] = rows;
    return Promise.resolve(result);
  };

  raw = () => Promise.resolve({ rows: [], command: 'null', fields: [], rowCount: 0, oid: 1 });

  transaction = async (queries: Query[]) => {
    return queries.map((query) => {
      const { type, entity } = query;
      if (type === 'insert') {
        const { data } = query.args as InsertQueryArgs;
        return this.insert(entity, data);
      }
      if (type === 'update') {
        const { data, where = {} } = query.args as UpdateQueryArgs;
        return this.update(entity, data, where);
      }
      if (type === 'delete') {
        const { where = {} } = query.args as DeleteQueryArgs;
        return this.delete(entity, where);
      }
    });
  };
}
