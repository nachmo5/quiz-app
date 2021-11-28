import request from '../../src/requests/quiz/fetchOne';
import { Predicate } from '../../src/shared/lib/orm';
import createMocks from '../mocks';
import { HandleFunc } from '../../src/shared/lib';

test('should send correct args to database', async () => {
  const { $database, ...rest } = createMocks();

  let intercepted: Predicate = {};
  $database.selectOne = (name, output) => {
    intercepted = output?.args?.where?.id as Predicate;
    return Promise.resolve({ root: null });
  };
  const result = await (request.handle as HandleFunc)(
    { args: { where: { id: { _eq: '2' } } }, output: { type: 'Quiz' } },
    { $database, ...rest }
  );
  expect(intercepted._eq).toBe('2');
});
