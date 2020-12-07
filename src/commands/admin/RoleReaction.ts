import { EternityCommandWSC, EternityMessageEmbed } from '@lib';
import { UserError } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import _ from 'lodash';
import async from 'async';
import i18n from 'i18next';

import type { Message } from '@providers/mongoose/models';
import type { Args } from '@sapphire/framework';
import type {
  EternityCommandWSCOptions,
  EternityMessage,
  EternityGuild,
} from '@lib';

@ApplyOptions<EternityCommandWSCOptions>({
  preconditions: ['GuildOnly', 'OwnerOnly'],
  subAliases: [
    ['delete', ['remove']],
  ],
  requiredArgs: [
    ['delete', ['message']],
    ['add', ['emoji', 'role']],
  ],
})
export default class extends EternityCommandWSC {
  private async document(guildId: string) {
    return new this.client.provider.Guilds(guildId);
  }

  private async mapToEmbed(
    guild: EternityGuild,
    emojiRoleMap: Map<string, string>,
    title?: string,
  ) {
    const embed = new EternityMessageEmbed();
    const fields = [
      { name: 'Emoji', value: '', inline: true },
      { name: 'Cargo', value: '', inline: true },
    ];

    await async.forEach(emojiRoleMap.entries(), async ([emoji, roleId]) => {
      const role = await guild.roles.fetch(roleId);
      const [emojiField, roleField] = fields;

      roleField.value += `${role?.name}\n`;
      emojiField.value += `${emoji}\n`;
    });

    if (title) embed.setTitle(title);
    embed.addFields(...fields);
    return embed;
  }

  private get firstEmbed() {
    return new EternityMessageEmbed().setTitle(i18n.t('commands/RoleReaction:firstEmbed'));
  }

  public subCommands = {
    create: async (msg: EternityMessage, args: Args) => {
      const document = await this.document(msg.guild.id);
      const message = await msg.channel.send(this.firstEmbed);

      const messageContent: Message = {
        emojiRoleMap: new Map(),
      };

      await args.pickResult('string')
        .then((result) => { if (result.success) messageContent.title = result.value; });

      document.set(`channels.${msg.channel.id}.messages.${message.id}`, messageContent);
    },

    delete: async (msg: EternityMessage, args: Args) => {
      const document = await this.document(msg.guild.id);
      const messagesPath = `channels.${msg.channel.id}.messages`;
      const messages = await document.get<Map<string, Message>>(messagesPath);

      const roleReactionMessage = await args.pickResult('message')
        .then((result) => {
          if (result.success && messages.has(result.value.id)) {
            return result.value;
          }
          throw new UserError(
            'commands/RoleReaction:delete:invalidRoleReactionMessage',
            'invalidRoleReactionMessage',
          );
        });

      messages.delete(roleReactionMessage.id);
      document.set(messagesPath, messages);
      roleReactionMessage.delete();
      (await msg.replyTranslated('commands/RoleReaction:delete:success'))
        .delete({ timeout: 20000 });
      msg.delete({ timeout: 20000 });
    },

    add: async (msg: EternityMessage, args: Args) => {
      const document = await this.document(msg.guild.id);
      const emoji = await args.pick('emoji');
      const role = await args.pick('role');

      const messages = await document.get<Map<string, Message>>(`channels.${msg.channel.id}.messages`, Map);
      const roleEmojiMessage = await args.pickResult('message').then((result) => {
        if (result.success && messages.has(result.value.id)) return result.value;
        return msg.channel.messages.fetch(_.last([...messages.keys()]));
      });

      await roleEmojiMessage.react(emoji.toString());
      const { emojiRoleMap, title } = messages.get(roleEmojiMessage.id);
      emojiRoleMap.set(emoji.toString(), role.id);

      await roleEmojiMessage.edit(await this.mapToEmbed(msg.guild, emojiRoleMap, title));
      await document.set(
        `channels.${msg.channel.id}.messages.${roleEmojiMessage.id}.emojiRoleMap`,
        emojiRoleMap,
      );

      (await msg.replyTranslated('commands/RoleReaction:add:success'))
        .delete({ timeout: 20000 });
      msg.delete({ timeout: 20000 });
    },

    renew: async (msg: EternityMessage, args: Args) => {
      const document = await this.document(msg.guild.id);

      const messagesPath = `channels.${msg.channel.id}.messages`;
      const messages = await document.get<Map<string, Message>>(`channels.${msg.channel.id}.messages`, Map);
      const emojiRoleMessage = await args.pickResult('message').then((result) => {
        if (result.success && messages.has(result.value.id)) return result.value;
        return msg.channel.messages.fetch(_.last([...messages.keys()]));
      });

      const { emojiRoleMap, title } = messages.get(emojiRoleMessage.id);
      const messageContent = emojiRoleMap.size > 0
        ? await this.mapToEmbed(msg.guild, emojiRoleMap, title)
        : this.firstEmbed;

      const newEmojiRoleMessage = await msg.channel.send(messageContent);
      messages.delete(emojiRoleMessage.id);
      messages.set(newEmojiRoleMessage.id, { emojiRoleMap });

      await document.set(messagesPath, messages);

      await emojiRoleMessage.delete();
      (await msg.replyTranslated('commands/RoleReaction:renew:success'))
        .delete({ timeout: 20000 });
      msg.delete({ timeout: 20000 });
    },
  };
}
