import 'module-alias/register';

import { EternityClient } from '@lib';
import { config } from './config';

const client = new EternityClient();

(async function main() {
  client.login(config.token);
}());
