const { api, apiToken, HOST, WS_HOST } = require('../util/api');
const WebSocket = require('ws');

const getApps = () => {
  return new Promise((resolve, reject) => {
    api.get(HOST + '/api/apps').then((response) => {
      resolve(response.data.apps);
    }).catch((error) => {
      reject(error);
    });
  })
};

const followLogs = (appId) => {
  const ws = new WebSocket(
    `${WS_HOST}/api/app-logs?appId=${appId}`,
    apiToken,
  );

  ws.on('message', function incoming(data) {
    console.log(data.toString().trim());
  });
};

module.exports = async function(commandArgs) {
  const appTitle = commandArgs[0];
  if (commandArgs.length !== 1) {
    console.log('Please provide the name of an app to view logs');
    return;
  }

  const apps = await getApps();
  const matchingApp = apps.find(app => app.title === appTitle);

  if (!matchingApp) {
    console.log(`App '${appTitle}' does not exist!`);
    return;
  }

  console.log(`Loading logs for '${matchingApp.title}'...`);

  await followLogs(matchingApp.id);
};
