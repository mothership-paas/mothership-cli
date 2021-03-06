const fs    = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const axios = require('axios').default;

const configPath = path.join(homedir, '.mothership-cli');
const apiTokenPath = path.join(configPath, 'apiToken');
const hostPath = path.join(configPath, 'host');
const url = require('url');
let apiToken;
let host;
let wsHost;

if (fs.existsSync(configPath) && fs.existsSync(apiTokenPath)) {
  apiToken = fs.readFileSync(path.join(configPath, 'apiToken'));
}

if (fs.existsSync(configPath) && fs.existsSync(hostPath)) {
  host = fs.readFileSync(path.join(configPath, 'host'));
} else {
    host = 'http://localhost:3000';
}

const wsProtocol = host.toString().startsWith('https:') ? 'wss:' : 'ws:';
const mothershipHost = url.parse(host.toString()).host;
wsHost = `${wsProtocol}//${mothershipHost}`;

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

const apiErrorHandler = (error) => {
  const errors = error.response.data.errors;
  errors.forEach(error => console.log("Error: " + error.message));
}

module.exports = {
  HOST: host,
  WS_HOST: wsHost,
  apiToken: apiToken.toString(),
  api: axios,
  apiErrorHandler: apiErrorHandler,
};
