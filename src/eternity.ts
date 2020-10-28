import 'module-alias/register';

import { EternityClient } from '@lib/client';
import { config } from './config';

const client = new EternityClient();

(async function main() {
  client.login(config.token);
}());
