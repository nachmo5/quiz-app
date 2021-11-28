import { OutputField } from '../typings';
import {
  DocumentNode,
  OperationDefinitionNode,
  SelectionSetNode,
  FieldNode,
  ValueNode,
  ObjectValueNode,
  ListValueNode,
  IntValueNode,
  FloatValueNode,
  StringValueNode,
  BooleanValueNode,
  EnumValueNode,
} from 'graphql';

const mapArgumentValue = (argValue: ValueNode, variables: Record<string, any>): unknown => {
  if (argValue.kind === 'Variable') {
    return variables[argValue.name.value];
  }

  if (argValue.kind === 'ObjectValue') {
    return (argValue as ObjectValueNode).fields.reduce(
      (acc, field) => ({ ...acc, [field.name.value]: mapArgumentValue(field.value, variables) }),
      {}
    );
  }
  if (argValue.kind === 'ListValue') {
    return (argValue as ListValueNode).values.map((v) => mapArgumentValue(v, variables));
  }

  return argValue
    ? (argValue as
        | IntValueNode
        | FloatValueNode
        | StringValueNode
        | BooleanValueNode
        | EnumValueNode).value
    : argValue;
};

const mapSelectionSet = (
  selectionSet: SelectionSetNode,
  variables: Record<string, any>
): OutputField[] =>
  (selectionSet.selections as FieldNode[]).reduce((nodes: OutputField[], selection: FieldNode) => {
    const fields = selection.selectionSet
      ? mapSelectionSet(selection.selectionSet, variables)
      : null;
    const args = (selection.arguments || []).reduce(
      (acc, arg) => ({ ...acc, [arg.name.value]: mapArgumentValue(arg.value, variables) }),
      {}
    );
    const node: OutputField = { name: selection.name.value };
    if (args && Object.keys(args).length > 0) node.args = args;
    if (fields && fields.length > 0) node.fields = fields;
    return [...nodes, node];
  }, []);

export default (graphqlAst: DocumentNode, variables?: Record<string, any>): OutputField => {
  const mappedAst = mapSelectionSet(
    (graphqlAst.definitions[0] as OperationDefinitionNode).selectionSet,
    variables || {}
  );
  return mappedAst[0];
};
