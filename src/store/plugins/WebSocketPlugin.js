/**
 * WebSocketPlugin will allow us to get new data from the server
 * without having to poll for changes on the frontend.
 *
 * This plugin is subscribed to host state property changes, which
 * is indicated in the app header Power status.
 *
 * https://github.com/openbmc/docs/blob/b41aff0fabe137cdb0cfff584b5fe4a41c0c8e77/rest-api.md#event-subscription-protocol
 */
const WebSocketPlugin = store => {
  let ws;
  const data = {
    paths: ['/xyz/openbmc_project/state/host0'],
    interfaces: ['xyz.openbmc_project.State.Host']
  };

  const initWebSocket = () => {
    ws = new WebSocket(`wss://${window.location.host}/subscribe`);
    ws.onopen = () => {
      ws.send(JSON.stringify(data));
    };
    ws.onerror = event => {
      console.error(event);
    };
    ws.onmessage = event => {
      const {
        properties: { CurrentHostState, RequestedHostTransition } = {}
      } = JSON.parse(event.data);
      const hostState = CurrentHostState || RequestedHostTransition;
      store.commit('global/setHostStatus', hostState);
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
