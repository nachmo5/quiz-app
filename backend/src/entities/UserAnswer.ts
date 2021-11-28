import { Entity } from '../shared/lib';

const UserAnswer: Entity = {
  name: 'UserAnswer',
  fields: {
    questionChoice: 'QuestionChoice',
    question: 'Question',
    user: 'string',
  },
};

export default UserAnswer;
