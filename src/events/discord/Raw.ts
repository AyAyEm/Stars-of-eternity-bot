import { EternityEvent } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageReaction } from 'discord.js';

import type { EventOptions } from '@sapphire/framework';
import type { TextChannel, User } from 'discord.js';
import type { RawPacket } from '@lib/types/Discord';

@ApplyOptions<EventOptions>({ event: 'raw' })
export default class extends EternityEvent<'raw'> {
  public async run(packet: RawPacket) {
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = await this.client.channels.fetch(packet.d.channel_id, true);
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if ((channel as TextChannel).messages.cache.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    (channel as TextChannel).messages.fetch(packet.d.message_id).then((message) => {
      // Emojis can have identifiers of name:id format, so we have to account for that case as well
      const emoji = packet.d.emoji.id ? packet.d.emoji.id : packet.d.emoji.name;
      // This gives us the reaction we need to emit the event properly, in top of the message object
      const reaction = new MessageReaction(this.client, {
        emoji: {
          name: emoji, id: null,
        },
      }, message);
      // Adds the currently reacting user to the reaction's users collection.
      const user = this.client.users.resolve(packet.d.user_id);
      if (reaction) reaction.users.cache.set(packet.d.user_id, user as User);
      // Check which type of event it is before emitting
      if (packet.t === 'MESSAGE_REACTION_ADD') {
        this.client.emit('messageReactionAdd', reaction, user);
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        this.client.emit('messageReactionRemove', reaction, user);
      }
    });
  }
}
