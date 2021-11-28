import { RequestTypeEnum } from '../../shared/lib/api';
import { EventData, RequestDefinition, Services } from '../../shared/lib/typings';

const handler: RequestDefinition = {
  name: 'userAnswer_count',
  type: RequestTypeEnum.fetch,
  output: { type: 'int' },
  args: [{ type: 'UserAnswer', category: 'filter', name: 'where' }],
  handle: async (data: EventData, { $database }: Services) => {
    // Args
    const { args = {} } = data;
    const { where = {} } = args;
    const quizId = where?.question?.quiz?.id?._eq;
    const isRight = where?.questionChoice?.isRight._eq;

    const userAnswers = await $database.raw('UserAnswer', []);
    return userAnswers.filter((userAnswer: any) => {
      let condition = true;
      if (quizId) {
        condition = condition && userAnswer.question.quiz.id === quizId;
      }
      if (isRight !== undefined) {
        condition = condition && userAnswer.questionChoice.isRight;
      }
      return condition;
    }).length;
  },
};

export default handler;
