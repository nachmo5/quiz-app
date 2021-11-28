import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery as useQueryApollo,
  useMutation as useMutationApollo,
} from '@apollo/client';
import { queries, mutations } from './requests';

const client = new ApolloClient({
  uri: 'http://localhost:4040/graphql',
  cache: new InMemoryCache(),
});

export const useQuery = (name, variables = {}, ...options) => {
  const { data, ...rest } = useQueryApollo(queries[name], { variables, ...options });
  return { data: data ? data[name] : null, ...rest };
};

export const useMutation = (name, ...options) => {
  const [mutate, ...rest] = useMutationApollo(mutations[name], ...options);
  const customMutate = (params, ...r) => mutate({ variables: params, ...r });
  return [customMutate, ...rest];
};

const DataProvider = (props) => {
  return <ApolloProvider client={client} {...props} />;
};

export default DataProvider;
