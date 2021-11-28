import { RequestDefinition, EventData, Services } from '../../shared/lib/typings';
import { RequestTypeEnum } from '../../shared/lib/api';

const handler: RequestDefinition = {
  name: 'quiz_fetch',
  output: { type: 'Quiz', list: true },
  type: RequestTypeEnum.fetch,
  handle: async (data: EventData, services: Services) => {
    const { $database } = services;
    // Args
    const { args = {}, output } = data;
    // Database data
    const dbOutput = { name: 'root', fields: output.fields, args };
    const result = await $database.select('Quiz', dbOutput);
    return result['root'];
  },
};

export default handler;
