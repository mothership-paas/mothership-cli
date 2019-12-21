const { api, HOST, apiErrorHandler } = require('../util/api');
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

const scaleUp = async () => {
  console.log('A DigitalOcean API token is needed to add a worker node.');
  const accessToken = await promptForInput('Please enter your DigitalOcean access token:');

  api.post(HOST + '/api/cluster/create', { accessToken })
  .then((response) => {
    console.log(response.data.message);
  })
  .catch(apiErrorHandler)
};

const scaleDown = () => {
  api.post(HOST + '/api/cluster/delete')
  .then((response) => {
    console.log(response.data.message);
  })
  .catch(apiErrorHandler)
};

module.exports = async function create(commandArgs) {
  const scaleOption = commandArgs[0];

  if (scaleOption === 'up') {
    scaleUp();
  } else if (scaleOption === 'down') {
    scaleDown();
  } else {
    console.log('cluster-scale requires a subcommand of \'up\' or \'down\'');
    return;
  }
};
