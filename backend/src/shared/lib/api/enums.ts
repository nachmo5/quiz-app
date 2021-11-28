export enum ScalarEnum {
  string = 'string',
  int = 'int',
  json = 'json',
  boolean = 'boolean',
  float = 'float',
}

export enum InputCategoryEnum {
  filter = 'filter',
  orderby = 'orderby',
  predicate = 'predicate',
  data = 'data',
  field = 'field',
}

export enum RequestTypeEnum {
  create = 'create',
  update = 'update',
  delete = 'delete',
  fetch = 'fetch',
}

export enum HttpMethodEnum {
  all = 'all',
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  patch = 'patch',
  options = 'options',
  head = 'head',
}
