import importDirectory from './shared/importDir';
import GraphqlMiddleware, { Entity, RequestDefinition } from './shared/lib';
import playground from './shared/lib/api/GraphqlMiddleware/playground';
// Services
import Server from './services/Server';
import MessageBus from './services/MessageBus';
import Database from './services/Database';
import Logger from './services/Logger';

const $logger = new Logger();

const start = async () => {
  // --------------------- Load files ------------------------
  const requests: RequestDefinition[] = await importDirectory('./requests');
  const entities: Entity[] = await importDirectory('./entities');
  // --------------------- Init services ------------------------
  const $bus = new MessageBus({ $logger });
  const $database = new Database(entities, { $logger });
  const $server = new Server({ $logger });
  // Middlewares
  const graphqlMiddleware = new GraphqlMiddleware().create({
    entities,
    requests,
    services: { $bus, $database },
  });
  $server.$app.post('/graphql', graphqlMiddleware);
  $server.$app.get('/playground', playground('/graphql'));
  return $server.start(4040);
};

start()
  .then(() => $logger.info('Application initialized'))
  .catch((e) => {
    $logger.info('Application crashed because of the following error');
    $logger.error(e);
  });
