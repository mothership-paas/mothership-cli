const { api, HOST } = require('../util/api');
const { table } = require('table');

module.exports = function() {
  api.get(HOST + '/api/apps').then((response) => {
    const tableRows = response.data.apps.map(app => {
      return [app.id, app.title, app.databaseId !== null ? 'Y' : 'N', app.url];
    });
    const tableHeader = ["ID", "Name", "DB?", "URL"];

    const output = table([tableHeader, ...tableRows], {
      drawHorizontalLine: (index, size) => {
        return index === 0 || index === 1 || index === size;
      }
    });

    console.log('');
    console.log('Mothership apps:')
    console.log(output);

  }).catch((error) => {
    console.log(error);
  }).finally(() => {});
}
