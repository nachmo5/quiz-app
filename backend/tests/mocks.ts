import Database from '../src/services/Database';
import MessageBus from '../src/services/MessageBus';

export default () => ({
  $logger: console,
  $bus: new MessageBus({ $logger: console }),
  $database: new Database([], { $logger: console }),
});
