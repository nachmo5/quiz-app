import { Entity } from '../shared/lib';

const Question: Entity = {
  name: 'Question',
  fields: {
    label: 'string',
    position: 'int',
    quiz: 'Quiz',
    questionChoices: { type: 'QuestionChoice', list: true, reference: 'question' },
  },
};

export default Question;
