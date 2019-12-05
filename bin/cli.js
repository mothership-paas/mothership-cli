#!/usr/bin/env node
const commandHandler = require('../lib/command-handler');
const [,, command, ...args] = process.argv;

(async () => {
  await commandHandler(command, args);
})();
