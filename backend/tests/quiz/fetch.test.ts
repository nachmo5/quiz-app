import request from '../../src/requests/quiz/fetch';
import createMocks from '../mocks';

test('should fetch correct data', async () => {
  const { $database, ...rest } = createMocks();

  $database.select = () => Promise.resolve({ root: [{ id: 'my id', title: 'quiz 1' }] });

  const result = await request.handle(
    { args: {}, output: { type: 'Quiz', fields: [{ name: 'id' }] } },
    { $database, ...rest }
  );
  expect(result[0].id).toBe('my id');
});
