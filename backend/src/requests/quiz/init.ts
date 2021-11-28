import { v4 as uuid } from 'uuid';
import { InsertQueryArgs, Query } from '../../shared/lib/orm';
import { EventData, RequestDefinition, Services } from '../../shared/lib/typings';

const handler: RequestDefinition = {
  name: 'quiz_init',
  output: { type: 'Quiz', list: true },
  handle: async ({ args }: EventData, { $database }: Services) => {
    const data: Query[] = [
      {
        entity: 'Quiz',
        type: 'insert',
        args: {
          data: {
            id: uuid(),
            title: 'Quiz 1',
            questions: [
              {
                id: uuid(),
                label: "What's 1+1?",
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),

                    label: '2',
                    position: null,
                    isRight: true,
                  },
                  {
                    id: uuid(),
                    label: '12',
                    position: null,
                    isRight: false,
                  },
                  {
                    id: uuid(),

                    label: '24',
                    position: null,
                    isRight: false,
                  },
                ],
              },
              {
                id: uuid(),

                label: 'Who is the CEO of Tesla?',
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),
                    label: 'Tusk',
                    position: null,
                    isRight: false,
                  },
                  {
                    id: uuid(),
                    label: 'Musk',
                    position: null,
                    isRight: true,
                  },
                  {
                    id: uuid(),
                    label: 'Fusk',
                    position: null,
                    isRight: false,
                  },
                ],
              },
              {
                id: uuid(),
                label: 'Are you having a nice day?',
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),
                    label: 'Yes',
                    position: null,
                    isRight: true,
                  },
                  {
                    id: uuid(),

                    label: 'No',
                    position: null,
                    isRight: false,
                  },
                ],
              },
            ],
          },
        },
      },
      {
        entity: 'Quiz',
        type: 'insert',
        args: {
          data: {
            id: uuid(),
            title: 'Quiz 2',
            questions: [
              {
                id: uuid(),
                label: 'What is the best company in the world?',
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),

                    label: 'Google',
                    position: null,
                    isRight: false,
                  },
                  {
                    id: uuid(),
                    label: 'Holis',
                    position: null,
                    isRight: true,
                  },
                  {
                    id: uuid(),
                    label: 'Facebook',
                    position: null,
                    isRight: false,
                  },
                ],
              },
              {
                id: uuid(),
                label: 'Who was the tzar of Russia?',
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),
                    label: 'Napoléon',
                    position: null,
                    isRight: false,
                  },
                  {
                    id: uuid(),
                    label: 'Rasputin',
                    position: null,
                    isRight: false,
                  },
                  {
                    id: uuid(),
                    label: 'Nicholas',
                    position: null,
                    isRight: true,
                  },
                ],
              },
              {
                id: 'eb303f17-9ce5-46eb-a7e5-5f574ebbc6dc',
                label: 'What is a dozen?',
                position: 1,
                questionChoices: [
                  {
                    id: uuid(),
                    label: '12',
                    position: null,
                    isRight: true,
                  },
                  {
                    id: uuid(),
                    label: '20',
                    position: null,
                    isRight: false,
                  },
                ],
              },
            ],
          },
        },
      },
    ];
    await $database.raw('clear', []);
    await $database.transaction(data);
    return data.map((el) => (el.args as InsertQueryArgs).data);
  },
};

export default handler;
