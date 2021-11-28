import {
  Subscriber,
  EventData,
  Messagebroker,
  ApplicationComponents,
  Services,
  Handler,
} from '../typings';

export default (components: ApplicationComponents, services: Services): void => {
  const { requests = [], handlers = [] } = components;
  // Extract handlers from requests
  const requestsHandlers: Handler[] = requests
    .filter((request) => !!request.handle)
    .map((request) => ({
      event: request.event || request.name,
      handle: request.handle,
    })) as Handler[];
  // wrap handlers to publish .done after success
  const wrappedHandlers = [...requestsHandlers, ...handlers].map((handler) => {
    const { event, handle } = handler;
    const wrappedHandle = async (data: EventData, services: Services): Promise<any> => {
      const { $bus } = services;
      const { args, context } = data;
      const result = await handle(data, services);
      $bus.publish(`${event}.done`, { args, context, output: { type: '_null' }, result });
      return result;
    };
    return { event, handle: wrappedHandle };
  });
  // Register each handler
  wrappedHandlers.forEach((handler) => {
    const { $bus } = services;
    const { handle, event } = handler;
    const subscriber: Subscriber = {
      event,
      handle: (event: EventData) => handle(event, services),
    };
    ($bus as Messagebroker).subscribe(event, subscriber);
  });
};
