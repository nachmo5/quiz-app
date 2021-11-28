import { Messagebroker } from '../shared/lib';
import { Subscriber, EventData, ServiceConfig } from '../typings';

export default class MessageBus implements Messagebroker {
  $log;

  constructor(config: ServiceConfig) {
    this.$log = config.$logger;
  }

  map: Record<string, Subscriber> = {};
  subscribe(event: string, subscriber: Subscriber) {
    this.map[event] = subscriber;
  }
  publish = async (event: string, data: EventData) => {
    if (!this.map[event]) {
      if (!event.includes('.done')) {
        this.$log.warn(`Warning! No handler found for event ${event}`);
      }
      return { code: 'NO_HANDLER', message: `No handler found for event ${event}` };
    }
    return this.map[event].handle(data);
  };
}
