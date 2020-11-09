import { EternityEvent } from '@lib';
import { toJoinChannel } from '@lib/eternity';
import { ApplyOptions } from '@sapphire/decorators';

import type { EventOptions } from '@sapphire/framework';
import type { EternityVoiceChannel } from '@lib';

@ApplyOptions<EventOptions>({ event: 'memberLeftChannel' })
export default class extends EternityEvent<'memberLeftChannel'> {
  public async run(channel: EternityVoiceChannel) {
    toJoinChannel(channel);
  }
}
