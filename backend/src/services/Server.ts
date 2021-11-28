import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { ServiceConfig } from '../typings';

export default class Server {
  $app: express.Application;
  $log;

  constructor(config: ServiceConfig) {
    this.$log = config.$logger;
    this.$app = express();
    this.$app.use(helmet());
    this.$app.use(express.json());
    this.$app.use(express.urlencoded({ extended: true }));
    this.$app.use(compression());
    this.$app.use(cors());
  }

  start = (port: number) =>
    new Promise((r) =>
      this.$app.listen(port, () => {
        this.$log.info('Server started on port ' + port);
        r(true);
      })
    );
}
