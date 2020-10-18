import { Client, PermissionLevels } from 'klasa';
import dotenv from 'dotenv';
import { config, token } from './config';

dotenv.config();

class MyKlasaClient extends Client {
  get provider() {
    return this.providers.get('mongoose');
  }
}

Object.assign(config, {
  permissionLevels: new PermissionLevels()
    .add(0, () => true)
    .add(5, ({ guild, member }: any) => guild && member.permissions.has('MANAGE_GUILD'), { break: true, fetch: true })
    .add(6, ({ guild, member }: any) => guild && member.permissions.has('ADMINISTRATOR'), { break: true, fetch: true })
    .add(7, ({ guild, member }: any) => (
      guild && member === guild.owner), { break: true, fetch: true })
    .add(9, ({ author, client }: any) => client.owners.has(author), { break: true })
    .add(10, ({ author, client }: any) => client.owners.has(author)),
});

new MyKlasaClient(config as any).login(token);
