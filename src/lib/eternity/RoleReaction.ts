import { MessageReaction, User } from 'discord.js';

import type { Message } from '@providers/mongoose/models';
import type { EternityEvent } from '../EternityEvent';

export async function roleReactionManager(
  this: EternityEvent,
  messageReaction: MessageReaction,
  user: User,
  action: 'add' | 'remove',
) {
  if (user.bot) return;

  const msg = messageReaction.message;
  const document = new this.client.provider.Guilds(msg.guild.id);

  const messageDocument = await document.get<Message>(`channels.${msg.channel.id}.messages.${msg.id}`);
  if (!messageDocument || messageDocument.msgType !== 'roleReaction') return;

  const { emojiRoleMap } = messageDocument;
  const emoji = messageReaction.emoji.toString();
  if (!emojiRoleMap || emojiRoleMap.size === 0) return;

  const role = emojiRoleMap.get(emoji);
  const member = await msg.guild.members.fetch(user.id);

  if (action === 'add' && !(member.roles.cache.has(role))) member.roles.add(role);
  else if (action === 'remove' && (member.roles.cache.has(role))) member.roles.remove(role);
}
