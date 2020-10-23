import 'module-alias/register';

import { EternityClient } from '@lib/client';
import { config } from '@config';

const client = new EternityClient();

client.login(config.token);
client.registerUserDirectories();
console.log(client.commands.size);
