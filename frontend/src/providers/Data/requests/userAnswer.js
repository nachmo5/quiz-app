import gql from 'graphql-tag';

const queries = {
  userAnswer_fetch: gql`
    query userAnswer_fetch($where: UserAnswerFilter) {
      userAnswer_fetch(where: $where) {
        id
        question {
          id
        }
        questionChoice {
          id
        }
      }
    }
  `,
  userAnswer_count: gql`
    query userAnswer_count($field: QuizFieldsEnum, $where: UserAnswerFilter) {
      userAnswer_count(where: $where, field: $field)
    }
  `,
};

const mutations = {
  userAnswer_create_many: gql`
    mutation userAnswer_create_many($data: [UserAnswerData]) {
      userAnswer_create_many(data: $data) {
        id
      }
    }
  `,
};

const requests = { queries, mutations };
export default requests;
