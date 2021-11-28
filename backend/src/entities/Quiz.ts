import { Entity } from '../shared/lib';

const Quiz: Entity = {
  name: 'Quiz',
  fields: {
    title: 'string',
    isFinished: 'bool',
    questions: { type: 'Question', list: true, reference: 'quiz' },
  },
};

export default Quiz;
