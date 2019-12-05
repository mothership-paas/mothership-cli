const EventSource = require('EventSource');
const { HOST } = require('./api');

module.exports = {
  listen: (endpoint) => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(HOST + endpoint);

      const messageHandler = (event) => {
        if (event.lastEventId === '-1') {
          eventSource.close();
          resolve();
          console.log('Build complete.');
          return;
        }

        if (event.lastEventId === '-2') {
          eventSource.close();
          reject();
          console.log('Build failed');
          return;
        }

        const message = JSON.parse(event.data);
        console.log(message.trim());
      };

      const errorHandler = (error) => {
        eventSource.close();
      };

      eventSource.addEventListener('message', messageHandler);
      eventSource.addEventListener('error', errorHandler);
    })
  }
}
