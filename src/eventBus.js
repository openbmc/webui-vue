import mitt from 'mitt';

const emitter = mitt();

function once(event, handler) {
  const wrapper = (...args) => {
    emitter.off(event, wrapper);
    handler(...args);
  };
  emitter.on(event, wrapper);
}

export default {
  // Vue 2-style alias
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit,
  $once: once,
  // Plain methods used by PS4 branch
  on: emitter.on,
  off: emitter.off,
  emit: emitter.emit,
  once,
};
