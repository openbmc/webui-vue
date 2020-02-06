/**
 * WebSocketPlugin will allow us to get new data from the server
 * without having to poll for changes on the frontend.
 *
 * This plugin is subscribed to host state property and logging
 * changes, indicated in the app header Health and Power status.
 *
 * https://github.com/openbmc/docs/blob/b41aff0fabe137cdb0cfff584b5fe4a41c0c8e77/rest-api.md#event-subscription-protocol
 */
const WebSocketPlugin = store => {
  let ws;
  const data = {
    paths: ['/xyz/openbmc_project/state/host0', '/xyz/openbmc_project/logging'],
    interfaces: [
      'xyz.openbmc_project.State.Host',
      'xyz.openbmc_project.Logging.Entry'
    ]
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
      const data = JSON.parse(event.data);
      const eventInterface = data.interface;
      const isGoodHealth = store.getters['eventLog/isGoodHealth'];

      if (eventInterface === 'xyz.openbmc_project.State.Host') {
        const { properties: { CurrentHostState } = {} } = data;
        store.commit('global/setHostStatus', CurrentHostState);
      } else if (isGoodHealth) {
        // Only need to change the health status if
        // not already critical
        const { interfaces, event } = data;
        if (event === 'InterfacesAdded' && interfaces) {
          // Checking for 'InterfacesAdded' events
          // since they have all properties needed to
          // change health status
          store.dispatch('eventLog/checkHealth', interfaces);
        }
      }
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
