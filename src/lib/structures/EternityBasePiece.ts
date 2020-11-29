import { BasePiece } from '@sapphire/framework';

import type { EternityClient } from '@lib';

export class EternityBasePiece extends BasePiece {
  get client(): EternityClient {
    return this.extras.client as EternityClient;
  }
}
