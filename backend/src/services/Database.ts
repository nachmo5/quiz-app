import { Entity } from '../shared/lib';
import {
  Connection,
  OutputAst,
  Predicate,
  WhereAst,
  Query,
  InsertQueryArgs,
  UpdateQueryArgs,
  DeleteQueryArgs,
} from '../shared/lib/orm';
import { ServiceConfig } from '../typings';

export default class Database implements Connection {
  $log;
  database: Record<string, any[]> = {};
  primaryKeyByEntity: Record<string, string> = {};

  constructor(entities: Entity[], config: ServiceConfig) {
    this.$log = config.$logger;
    // init tables
    entities.forEach((entity) => (this.database[entity.name] = []));
    // primary keys
    this.primaryKeyByEntity = entities.reduce((acc, entity) => {
      return { ...acc, [entity.name]: 'id' };
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

  raw = (type: string) => {
    if (type === 'clear') {
      Object.keys(this.database).forEach((entityName) => {
        this.database[entityName] = [];
      });
    } else if (type) {
      return Promise.resolve(this.database[type]);
    }
    return Promise.resolve({ rows: [], command: 'null', fields: [], rowCount: 0, oid: 1 });
  };

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
