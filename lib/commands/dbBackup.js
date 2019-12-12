const { api, HOST } = require('../util/api');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

const getApps = () => {
  return new Promise((resolve, reject) => {
    api.get(HOST + '/api/apps').then((response) => {
      resolve(response.data.apps);
    }).catch((error) => {
      reject(error);
    });
  })
}

module.exports = async function(commandArgs) {
  const appTitle = commandArgs[0];
  let loading;
  if (commandArgs.length !== 1) {
    console.log('Please provide the name of the app to deploy');
    return;
  }

  console.log(`Connecting to '${appTitle}'...`);

  const apps = await getApps();
  const app = apps.find(app => app.title === appTitle);
  const dumpPath = path.join(homedir, '.mothership-cli', `${app.title}.sql`);

  if (!app) {
    console.log(`App '${appTitle}' does not exist!`);
    return;
  }

  api.get(HOST + `/api/apps/${app.id}/dbdump`) 
    .then(response => {
      if (response.status === 200) {
        fs.writeFileSync(dumpPath, response.data);
        console.log(`Success! A backup of ${app.title}'s database has been saved at ${dumpPath}`);
      }
      // TODO: Handle case where app doesn't have a database
    })
    .catch(error => console.log('Something went wrong! Please try again.'));
}
