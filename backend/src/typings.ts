import Logger from './services/Logger';

export interface EventData extends Record<string, any> {
  args: Record<string, any>;
  context?: Record<string, any>;
}

export interface Subscriber {
  event: string;
  handle(data: EventData): Promise<unknown>;
}

export interface Service {}

export interface ServiceConfig {
  $logger: Logger;
}

export interface Handler {
  name: string;
  output: HandlerType;
  args?: HandlerType[];
  handle: (data: EventData, services: Service[]) => Promise<unknown>;
}

export interface HandlerType {
  type: unknown;
  list?: boolean;
}
