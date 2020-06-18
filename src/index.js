require('dotenv').config();

const { Client, PermissionLevels } = require('klasa');
const { config, token } = require('./config');

class MyKlasaClient extends Client {
  // eslint-disable-next-line no-useless-constructor
  constructor(...args) {
    super(...args);
    // Add any properties to your Klasa Client
  }
  // Add any methods to your Klasa Client
}

config.permissionLevels = new PermissionLevels()
  .add(0, () => true)
  .add(5, ({ guild, member }) => guild && member.permissions.has('MANAGE_GUILD'), { break: true, fetch: true })
  .add(6, ({ guild, member }) => guild && member.permissions.has('ADMINISTRATOR'), { break: true, fetch: true })
  .add(7, ({ guild, member }) => guild && member === guild.owner, { break: true, fetch: true })
  .add(9, ({ author, client }) => client.owners.has(author), { break: true })
  .add(10, ({ author, client }) => client.owners.has(author));
// Allows the bot owner to use Bot Owner only commands, which silently fail for other users.

new MyKlasaClient(config).login(token);
