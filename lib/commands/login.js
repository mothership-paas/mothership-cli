const { api, HOST } = require('../util/api');
const { table, getBorderCharacters } = require('table');

module.exports = function(commandArgs) {
  const username = commandArgs[0];
  const password = commandArgs[1];

  console.log(`username: ${username}, password: ${password}`);
  // api.post(HOST + '/api/login').then((response) => {
  // ...
  // }).catch((error) => {
  //   console.log(error);
  // }).finally(() => {});
}
