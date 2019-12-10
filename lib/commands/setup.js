const Docker = require('dockerode');
const DockerMachine = require('docker-machine');
const fs = require('fs');
const ora = require('ora');
const { table } = require('table');

const MOTHERSHIP_NODE_NAME = 'mothership-paas';
const SWARM_MANAGER_NODE_NAME = 'mothership-swarm';
// TODO: Change the `image` from this file to point at our team repo (once we make on)
const DOCKER_COMPOSE_CONTENT = `version: '3'

services:
  web:
    image: jkulton/paas:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker:/root/.docker
    ports:
      - "80:3000"

  database:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:`;

const dbSeedContent = (swarmManagerName, swarmManagerIp, domain) => {
  return `'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Nodes', [
      {
        name: '${swarmManagerName}',
        ip_address: '${swarmManagerIp}',
        manager: true,
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()'),
      }
    ]).then(() => {
      return queryInterface.bulkInsert('Configs', [
        {
          key: 'domain',
          value: '${domain}',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          key: 'proxyNetwork',
          value: 'proxy',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        }
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Nodes', null, {}).then(() => {
      return queryInterface.bulkDelete('Configs', null, {});
    });
  },
}`;
};

const createDockerMachine = (name, accessToken) => {
  return new Promise((resolve, reject) => {
    const options = { 'digitalocean-access-token': accessToken };

    DockerMachine.create(name, 'digitalocean', options, (err) => {
      if (err) { reject(err); }
      resolve();
    });
  });
};

const getMachineIp = (name) => {
  return new Promise((resolve, reject) => {
    const machine = new DockerMachine(name);
    machine.inspect((err, result) => {
      if (err) reject(err);
      resolve(result.driver.ipAddress);
    });
  });
};

const sshMachine = (machine, command) => {
  return new Promise((resolve, reject) => {
    machine.ssh(command, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const main = async () => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptForInput = (prompt) => {
    return new Promise((resolve, reject) => {
      readline.question(prompt + '\n> ', (input) => {
        resolve(input);
      });
    });
  };

  let result;
  let loading;
  console.clear();
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('~~ Welcome to Mothership. ~~');
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('');

  // Prompt user for DO access token
  const accessToken = await promptForInput('Please enter your DigitalOcean access token:');
  // Prompt user for domain for PaaS
  const domain = await promptForInput("Please enter the domain you'd like your server to run on:");

  // ---

  console.log('');
  console.log('MOTHERSHIP SETUP');
  // Create droplet for PaaS server to run on
  loading = ora('Creating droplet for Mothership (this may take a few moments)...').start();
  await createDockerMachine(MOTHERSHIP_NODE_NAME, accessToken).catch(err => {
    console.log('catch error:');
    console.log(err);
  });
  loading.succeed();

  // Store IP address of Mothership node
  loading = ora('Getting IP address of Mothership node...');
  const mothershipIp = await getMachineIp(MOTHERSHIP_NODE_NAME);
  loading.succeed();

  // Switch docker context to Mothership node
  loading = ora('Logging into Mothership droplet...').start();
  const mothershipNode = new DockerMachine(MOTHERSHIP_NODE_NAME);
  loading.succeed();

  // Install PaaS to Mothership node
  loading = ora('Creating docker-compose.yml for Mothership...').start();
  result = await sshMachine(mothershipNode, `echo "${DOCKER_COMPOSE_CONTENT}" >> docker-compose.yml`)
  loading.succeed();

  // Docker Machine and Docker Compose aren't installed by default on nodes you create with Docker Machine
  // TODO: either clean this up, or run our PaaS app without docker-compose?
  loading = ora('Installing docker-compose...').start();
  result = await sshMachine(mothershipNode, `sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`);
  result = await sshMachine(mothershipNode, `sudo chmod +x /usr/local/bin/docker-compose`);
  loading.succeed();

  loading = ora('Installing docker-machine...').start();
  result = await sshMachine(mothershipNode, `base=https://github.com/docker/machine/releases/download/v0.16.2 &&
  curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
  sudo mv /tmp/docker-machine /usr/local/bin/docker-machine &&
  chmod +x /usr/local/bin/docker-machine`);
  loading.succeed();

  loading = ora('Starting Mothership server (Node.js + Postgres)...').start();
  result = await sshMachine(mothershipNode, `docker-compose up -d`);
  loading.succeed();

  loading = ora('Creating database for Mothership...').start();
  result = await sshMachine(mothershipNode, `docker-compose run web ./node_modules/.bin/sequelize db:create`);
  loading.succeed();

  loading = ora('Running migrations for Mothership database...').start();
  result = await sshMachine(mothershipNode, `docker-compose run web ./node_modules/.bin/sequelize db:migrate`);
  loading.succeed();

  // Create swarm manager node FROM Mothership node
  // (this way, all information about the swarm manager is stored on the Mothership node)
  console.log('');
  console.log('MOTHERSHIP SWARM SETUP');
  loading = ora('Creating droplet for Mothership swarm manager...').start();
  result = await sshMachine(mothershipNode, `docker-machine create --driver digitalocean --digitalocean-access-token ${accessToken} ${SWARM_MANAGER_NODE_NAME}`);
  loading.succeed();

  // Get IP address of cluster manager
  loading = ora('Getting IP address...').start();
  let swarmManagerIp = await sshMachine(mothershipNode, `docker-machine ip ${SWARM_MANAGER_NODE_NAME}`);
  swarmManagerIp = swarmManagerIp.trim();
  loading.succeed();

  // Initialize Docker Swarm on swarm manager
  loading = ora('Initializing swarm...').start();
  result = await sshMachine(mothershipNode, `eval $(docker-machine env ${SWARM_MANAGER_NODE_NAME});docker swarm init --advertise-addr ${swarmManagerIp}`)
  loading.succeed();

  loading = ora('Creating overlay network...').start();
  result = await sshMachine(mothershipNode, `eval $(docker-machine env ${SWARM_MANAGER_NODE_NAME});docker network create --driver overlay proxy`);
  loading.succeed();

  // Create docker-flow-proxy-listener service
  loading = ora('Creating docker-flow-swarm-listener service...').start();
  result = await sshMachine(mothershipNode, `eval $(docker-machine env ${SWARM_MANAGER_NODE_NAME});docker service create --name swarm-listener \
--network proxy \
--mount "type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock" \
-e DF_NOTIFY_CREATE_SERVICE_URL=http://proxy:8080/v1/docker-flow-proxy/reconfigure \
-e DF_NOTIFY_REMOVE_SERVICE_URL=http://proxy:8080/v1/docker-flow-proxy/remove \
--constraint 'node.role==manager' \
dockerflow/docker-flow-swarm-listener`);
  loading.succeed();

  // Create docker-flow-proxy service
  loading = ora('Creating docker-flow-proxy service...').start();
  result = await sshMachine(mothershipNode, `eval $(docker-machine env ${SWARM_MANAGER_NODE_NAME});docker service create --name proxy \
-p 80:80 \
-p 443:443 \
--network proxy \
-e LISTENER_ADDRESS=swarm-listener \
dockerflow/docker-flow-proxy`);
  loading.succeed();

  console.log('');
  console.log('MOTHERSHIP CONFIG');
  // Writes a seed file into the running Node.js web container with initial Config and Node db rows
  loading = ora('Writing file with Mothership\'s configuration settings...');
  result = await sshMachine(mothershipNode, `echo "${dbSeedContent('mothership-swarm', swarmManagerIp, domain)}" >> ./config-seed.js`);
  result = await sshMachine(mothershipNode, `docker cp config-seed.js root_web_1:/usr/src/app/seeders/config-seed.js`);
  loading.succeed();

  // Runs seed file
  loading = ora('Inserting configuration settings into Mothership\'s database...');
  result = await sshMachine(mothershipNode, `docker-compose exec -T web ./node_modules/.bin/sequelize db:seed --seed config-seed.js`);
  loading.succeed();

  // We're now done! Prints info on what needs added to their DNS and the IP where the Node.js app lives.
  console.log('');
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('~~ Mothership installer complete! ~~');
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('');
  console.log('Note: To finish configuration you\'ll need to add the');
  console.log('following resource records to your DNS provider:');

  const output = [
    ["Name", "Type", "IP Address"],
    ["@", "A", `${swarmManagerIp}`],
    ["*", "A", `${swarmManagerIp}`],
    ["mothership", "A", `${mothershipIp}`]
  ];

  console.log(table(output));
  console.log(`After adding these resource records visit Mothership online: http://mothership.${domain}`);

  readline.close();
  process.exit();
};

module.exports = async function() {
  main();
}
