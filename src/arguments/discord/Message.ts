import { Argument, ArgumentContext, PieceContext } from '@sapphire/framework';

import type { EternityMessage } from '@lib';

export class Message extends Argument<EternityMessage> {
  public constructor(context: PieceContext) {
    super(context, { name: 'message' });
  }

  public async run(argument: string, context: ArgumentContext) {
    const message = await context.message.channel.messages.fetch(argument) as EternityMessage;
    const defaultMessage = 'Argument passed cannot resolve to a valid message in this channel';
    if (!message) return this.error('ArgumentInvalidMessage', defaultMessage);
    return this.ok(message);
  }
}
