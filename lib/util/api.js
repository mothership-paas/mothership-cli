const fs    = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const axios = require('axios').default;

const configPath = path.join(homedir, '.mothership-cli');
const apiTokenPath = path.join(configPath, 'apiToken');
let apiToken;

if (fs.existsSync(configPath) && fs.existsSync(apiTokenPath)) {
  apiToken = fs.readFileSync(path.join(configPath, 'apiToken'));
}

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

const apiErrorHandler = (error) => {
  const errors = error.response.data.errors;
  errors.forEach(error => console.log("Error: " + error.message));
}

module.exports = {
  HOST: 'http://localhost:3000', // TODO: change this once user sets up / logs in to PaaS
  WS_HOST: 'ws://localhost:3000',
  apiToken: apiToken.toString(),
  api: axios,
  apiErrorHandler: apiErrorHandler,
};
