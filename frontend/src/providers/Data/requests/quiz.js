import gql from 'graphql-tag';

const queries = {
  quiz_fetch: gql`
    query quiz_fetch{
      quiz_fetch {
        id
        title
      }
    }
  `,
  quiz_fetch_one: gql`
    query quiz_fetch_one($where: QuizFilter!) {
      quiz_fetch_one(where: $where) {
        id
        title
        questions {
          id
          label
          position
          questionChoices {
            id
            label
          }
        }
      }
    }
  `,
};

const mutations = {
  quiz_init: gql`
    mutation quiz_init {
      quiz_init {
        id
      }
    }
  `,
};

const requests = { queries, mutations };
export default requests;
