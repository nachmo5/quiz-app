import { RequestTypeEnum } from '../../shared/lib/api';
import { RequestDefinition, EventData, Services } from '../../shared/lib/typings';

const handler: RequestDefinition = {
  name: 'quiz_fetch_one',
  type: RequestTypeEnum.fetch,
  output: { type: 'Quiz' },
  args: [{ name: 'where', type: 'Quiz', category: 'filter' }],
  handle: async ({ args = {}, output }: EventData, services: Services) => {
    // Services
    const { $database } = services;
    // Args
    const { where } = args;
    if (!where.id) {
      throw { code: 'MISSING_ID', message: 'Missing id' };
    }
    // Database data
    const dbOutput = { name: 'root', fields: output.fields, args };
    const result = await $database.selectOne('Quiz', dbOutput);
    return result['root'];
  },
};

export default handler;
