const axios = require('axios').default;
axios.defaults.headers.common['Accept'] = 'application/json';

module.exports = {
  HOST: 'http://localhost:3000', // TODO: change this once user sets up / logs in to PaaS
  api: axios,
};
