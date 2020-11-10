import { Argument, ArgumentContext, PieceContext } from '@sapphire/framework';
import { Emoji as DiscordEmoji } from 'discord.js';

export class Emoji extends Argument<DiscordEmoji> {
  public constructor(context: PieceContext) {
    super(context, { name: 'emoji' });
  }

  public unicodeEmojiRegex = /u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

  public async run(argument: string, context: ArgumentContext) {
    const unicodeEmoji = this.unicodeEmojiRegex.test(argument)
      ? argument.match(this.unicodeEmojiRegex)[0]
      : null;

    if (unicodeEmoji) {
      return this.ok(new DiscordEmoji(this.client, {
        name: unicodeEmoji,
        identifier: unicodeEmoji,
        id: null,
        animated: false,
      }));
    }

    const id = argument.match(/\d+/)[0];
    const guildEmoji = context.message.guild.emojis.resolve(id) || null;
    if (guildEmoji) return this.ok(guildEmoji);
    const defaultErrorMessage = 'Argument passed cannot resolve to a valid emoji';
    return this.error(argument, 'ArgumentInvalidEmoji', defaultErrorMessage);
  }
}
