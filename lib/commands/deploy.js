const eventStream = require('../util/event');
const { api, HOST } = require('../util/api');

const FormData = require('form-data');
const archiver = require('archiver');
const ora = require('ora');
const fs = require('fs');

const archiveProject = () => {
  let loading;
  return new Promise((resolve, reject) => {
    loading = ora('Preparing project for upload').start();

    const archive = archiver('zip');
    const output = fs.createWriteStream(__dirname + '/../../deploy.zip');

    archive.on('error', (err) => {
      throw err;
      reject(err);
    });

    output.on('close', () => {
      loading.succeed();
      resolve();
    });

    archive.pipe(output);

    archive.glob('./**/*', {
      ignore: [
        './node_modules/**/*',        // Ignore files under /node_modules
        './.git/**/*',                // Ignore files under /.git
      ]
    });

    archive.finalize();
  });
};

const uploadProject = (appId) => {
  let loading;

  return () => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', fs.createReadStream(__dirname + '/../../deploy.zip'));
      const formHeaders = form.getHeaders();

      loading = ora('Uploading project...').start();
      api.post(HOST + `/api/apps/${appId}/deploy`, form, {
        headers: {
          ...formHeaders,
        },
      })
      .then(response => {
        loading.succeed();

        if (response.status === 201) {
          resolve(response.data.stream);
        }
      })
      .catch(error => error)
    });
  }
};

const subscribeToEvents = (endpoint) => {
  return new Promise((resolve, reject) => {
    eventStream.listen(endpoint).then(() => {
      resolve();
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
};

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

  console.log(`Attempting to deploy app '${appTitle}'...`);

  const apps = await getApps();
  const matchingApp = apps.find(app => app.title === appTitle);

  if (!matchingApp) {
    console.log(`App '${appTitle}' does not exist!`);
    return;
  }

  archiveProject()
    .then(uploadProject(matchingApp.id))
    .then(subscribeToEvents)
    .then(() => {
      console.log(`Deployment complete. App is online at ${matchingApp.url}`);
    })
    .catch(err => console.log(err));
};
