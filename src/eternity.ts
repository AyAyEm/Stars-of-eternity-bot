import 'module-alias/register';

import { EternityClient } from '@lib/client';
import { config } from '@config';

const client = new EternityClient();

void async function main() {
  client.login(config.token);
}();
