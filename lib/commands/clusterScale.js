const { api, HOST } = require('../util/api');
const Readline = require('readline');

const promptForInput = (prompt) => {
  return new Promise((resolve, reject) => {
    const readline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(prompt + '\n> ', (input) => {
      readline.close();
      resolve(input);
    });
  });
};

const scaleUp = () => {
  console.log('A DigitalOcean API token is needed to add a worker node.');
  const accessToken = await promptForInput('Please enter your DigitalOcean access token:');

  api.post(HOST + '/api/cluster/create', { accessToken })
  .then((response) => {
    console.log('create response:', response.status, response.data);
    // if (response.status === 201) {
    //   const app = response.data.app;
    //   console.log(`Created ${app.title}!`)
    // }
  })
  .catch((error) => {
    const errors = error.response.data.errors;
    errors.forEach(error => console.log("Error: " + error.message));
  })
  .finally(() => {})
};

const scaleDown = () => {
  api.post(HOST + '/api/cluster/delete')
  .then((response) => {
    console.log('delete response:', response.status, response.data);
    // if (response.status === 201) {
    //   const app = response.data.app;
    // }
  })
  .catch((error) => {
    const errors = error.response.data.errors;
    //  errors.forEach(error => console.log("Error: " + error.message));
  })
  .finally(() => {})
};

module.exports = async function create(commandArgs) {
  const scaleOption = commandArgs[0];

  if (scaleOption === 'up') {

  } else if (scaleOption === 'down') {
  } else {
    console.log('cluster-scale requires a subcommand of \'up\' or \'down\'');
    return;
  }
};
