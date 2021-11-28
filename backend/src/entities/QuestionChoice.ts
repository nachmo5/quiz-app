import { Entity } from '../shared/lib';

const QuestionChoice: Entity = {
  name: 'QuestionChoice',
  fields: {
    label: 'string',
    position: 'int',
    isRight: { type: 'bool', _noOutput: true },
    question: 'Question',
  },
};

export default QuestionChoice;
