import { v4 as uuid } from 'uuid';
import { EventData, RequestDefinition, Services } from '../../shared/lib/typings';

const handler: RequestDefinition = {
  name: 'userAnswer_create_many',
  output: { type: 'UserAnswer', list: true },
  args: [{ type: 'UserAnswer', category: 'data', name: 'data', list: true }],
  handle: async ({ args }: EventData, { $database }: Services) => {
    const answers = args.data;

    const data = await Promise.all(
      answers.map(async (answer: any) => {
        const quizzes = await $database.raw('Quiz', []);
        const quiz = quizzes.find((quiz: any) =>
          quiz.questions.find((q: any) => q.id === answer.question.id)
        );
        const question = quiz.questions.find((q: any) => q.id === answer.question.id);
        const questionChoice = question.questionChoices.find(
          (qc: any) => qc.id == answer.questionChoice.id
        );
        return { id: uuid(), question: { ...question, quiz: { id: quiz.id } }, questionChoice };
      })
    );
    await $database.transaction(
      data.map((answer: any) => ({
        entity: 'UserAnswer',
        type: 'insert',
        args: { data: answer },
      }))
    );
    return data;
  },
};

export default handler;
