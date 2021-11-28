import express, { NextFunction } from 'express';
import { HttpMethod, Middleware } from './typings';

export default class HttpServer {
  $server: express.Application;
  port;

  constructor(port: number) {
    this.$server = express();
    this.port = port;
  }

  addMidleware = (middleware: Middleware): void => {
    const { route = '/', method = 'use', process } = middleware;
    this.$server[method](route, process);
  };

  start = () =>
    new Promise((r) =>
      this.$server.listen(this.port, () => {
        r(true);
      })
    );
}
