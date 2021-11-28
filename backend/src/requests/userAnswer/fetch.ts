import { RequestTypeEnum } from '../../shared/lib/api';
import { RequestDefinition, EventData, Services } from '../../shared/lib/typings';

const handler: RequestDefinition = {
  name: 'userAnswer_fetch',
  type: RequestTypeEnum.fetch,
  output: { type: 'UserAnswer', list: true },
  handle: async (data: EventData, services: Services) => {
    const { $database } = services;
    // Args
    const { args = {}, output } = data;
    // Database data
    const dbOutput = { name: 'root', fields: output.fields, args };
    const result = await $database.select('UserAnswer', dbOutput);
    const quizId = data.args?.where?.question?.quiz?.id?._eq;
    if (quizId) {
      const userAnswers = await $database.raw('UserAnswer', []);
      return userAnswers.filter((userAnswer: any) => userAnswer.question.quiz.id === quizId);
    }
    return result['root'];
  },
};

export default handler;
