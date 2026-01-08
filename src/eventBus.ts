import mitt from 'mitt';

type Handler = (...args: unknown[]) => void;

type EventBus = {
  // Vue 2-style aliases
  $on: (type: string, handler: Handler) => void;
  $off: (type: string, handler: Handler) => void;
  $emit: (type: string, event?: unknown) => void;
  $once: (type: string, handler: Handler) => void;

  // Plain methods used elsewhere
  on: (type: string, handler: Handler) => void;
  off: (type: string, handler: Handler) => void;
  emit: (type: string, event?: unknown) => void;
  once: (type: string, handler: Handler) => void;

  // Ad-hoc properties used in the app (e.g., storing a console window handle)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const emitter = mitt();

function once(event: string, handler: Handler) {
  const wrapper: Handler = (...args) => {
    emitter.off(event, wrapper);
    handler(...args);
  };
  emitter.on(event, wrapper);
}

const eventBus: EventBus = {
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit,
  $once: once,
  on: emitter.on,
  off: emitter.off,
  emit: emitter.emit,
  once,
};

export default eventBus;

