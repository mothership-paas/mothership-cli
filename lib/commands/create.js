const { api, HOST } = require('../util/api');

module.exports = async function create(commandArgs) {
  const title = commandArgs[0];

  if (commandArgs.length > 1) {
    console.log('App names may not include spaces!');
    return;
  }

  if (!title) {
    console.log('Please provide a name for the app');
    return;
  }

  console.log(`Creating '${title}'...`);

  api.post(HOST + '/api/apps', { title })
  .then((response) => {
    if (response.status === 201) {
      const app = response.data.app;
      console.log(`Created ${app.title}!`)
    }
  })
  .catch((error) => {
    const errors = error.response.data.errors;
    errors.forEach(error => console.log("Error: " + error.message));
  })
  .finally(() => {})
};
