const { api, HOST } = require('../util/api');
const open = require('open');

const getApps = () => {
  return new Promise((resolve, reject) => {
    api.get(HOST + '/api/apps').then((response) => {
      resolve(response.data.apps);
    }).catch((error) => {
      reject(error);
    });
  })
};

module.exports = async function(commandArgs) {
  const appTitle = commandArgs[0];
  let loading;
  if (commandArgs.length !== 1) {
    console.log('Please provide the name of the app to open');
    return;
  }

  const apps = await getApps();
  const matchingApp = apps.find(app => app.title === appTitle);

  if (!matchingApp) {
    console.log(`App '${appTitle}' does not exist!`);
    return;
  }

  await open('http://' + matchingApp.url);
};
