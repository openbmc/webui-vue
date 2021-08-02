/**
 * WebSocketPlugin will allow us to get new data from the server
 * without having to poll for changes on the frontend.
 *
 * This plugin is subscribed to host state property and logging
 * changes, indicated in the app header Health and Power status.
 *
 * https://github.com/openbmc/docs/blob/b41aff0fabe137cdb0cfff584b5fe4a41c0c8e77/rest-api.md#event-subscription-protocol
 */
const WebSocketPlugin = (store) => {
  let ws;
  const data = {
    paths: ['/xyz/openbmc_project/state/host0', '/xyz/openbmc_project/logging'],
    interfaces: [
      'xyz.openbmc_project.State.Host',
      'xyz.openbmc_project.Logging.Entry',
    ],
  };

  const initWebSocket = () => {
    const socketDisabled =
      process.env.VUE_APP_SUBSCRIBE_SOCKET_DISABLED === 'true' ? true : false;
    if (socketDisabled) return;
    const token = store.getters['authentication/token'];
    ws = new WebSocket(`wss://${window.location.host}/subscribe`, [token]);
    if (process.env.NODE_ENV === 'test') {
      ws = new WebSocket('ws://localhost:1234/subscribe');
    }
    ws.onopen = () => {
      ws.send(JSON.stringify(data));
    };
    ws.onerror = (event) => {
      console.error(event);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      store.dispatch('global/dispatchWebSocketData', data);
    };
  };

  store.subscribe(({ type }) => {
    if (type === 'authentication/authSuccess') {
      initWebSocket();
    }
    if (type === 'authentication/logout') {
      if (ws) ws.close();
    }
  });

  if (store.getters['authentication/isLoggedIn']) initWebSocket();
};

export default WebSocketPlugin;
