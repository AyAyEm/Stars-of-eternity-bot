import { EternityEvent } from '@lib';
import { toJoinChannel } from '@lib/eternity';
import { ApplyOptions } from '@sapphire/decorators';

import type { EventOptions } from '@sapphire/framework';
import type { EternityVoiceChannel } from '@lib';

@ApplyOptions<EventOptions>({ event: 'memberJoinedChannel', enabled: false })
export default class extends EternityEvent<'memberJoinedChannel'> {
  public async run(channel: EternityVoiceChannel) {
    toJoinChannel(channel);
  }
}
