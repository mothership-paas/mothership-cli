const fs    = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const EventSource = require('EventSource');
const { HOST } = require('./api');

module.exports = {
  listen: (endpoint) => {
    return new Promise((resolve, reject) => {
      const configPath = path.join(homedir, '.mothership-cli');
      const apiTokenPath = path.join(configPath, 'apiToken');
      let apiToken;

      if (fs.existsSync(configPath) && fs.existsSync(apiTokenPath)) {
        apiToken = fs.readFileSync(path.join(configPath, 'apiToken'));
      }

      const eventSource = new EventSource(
        HOST + endpoint,
        { headers: { 'Authorization': `Bearer ${apiToken}` } }
      );

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
