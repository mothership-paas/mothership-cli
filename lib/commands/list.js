const { api, HOST } = require('../util/api');
const { table, getBorderCharacters } = require('table');

module.exports = function() {
  api.get(HOST + '/api/apps').then((response) => {
    const tableRows = response.data.apps.map(app => {
      return [app.id, app.title, app.databaseId !== null ? 'Y' : 'N', app.url];
    });
    const tableHeader = ["ID", "Name", "DB?", "URL"];

    const output = table([tableHeader, ...tableRows]);

    console.log('Mothership apps:')
    console.log(output);

  }).catch((error) => {
    console.log(error);
  }).finally(() => {});
}
