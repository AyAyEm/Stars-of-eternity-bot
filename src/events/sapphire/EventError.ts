import { EternityEvent } from '@lib';
import { Events } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.EventError })
export default class extends EternityEvent<Events.EventError> {
  public async run(err: Error) {
    console.error(err);
  }
}
