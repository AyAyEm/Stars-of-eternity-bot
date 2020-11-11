import { EternityEvent } from '@lib';
import { Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.Error })
export default class extends EternityEvent<Events.Error> {
  public async run(err: Error) {
    this.client.console.error(err);
  }
}
