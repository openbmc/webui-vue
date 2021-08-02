import { Server } from 'mock-socket';

const DATA_LENGTH = 50;
let messages = [];

const WebSocketServer = (serverURL) => {
  const server = new Server(serverURL);
  const url = new URL(serverURL);

  server.on('connection', (socket) => {
    socket.on('message', (data) => {
      const incomingData = JSON.parse(data);

      switch (url.pathname) {
        case '/subscribe':
          if ('interfaces' in incomingData) {
            const interfaceLen = incomingData.interfaces.length;
            const maxValue = 100;
            for (let i = 0; i < DATA_LENGTH; i++) {
              messages.push({
                Path: 'Fake_Path',
                Interface: incomingData.interfaces[i % interfaceLen],
                Value: Math.floor(Math.random() * maxValue),
              });
            }
          }
          break;
      }
      sendMessages(socket);
    });
  });

  return server;
};

const sendMessages = (socket) => {
  const data = messages.pop();
  if (data) {
    socket.send(JSON.stringify(data));
    setTimeout(sendMessages, 50, socket);
  }
};

export default WebSocketServer;
