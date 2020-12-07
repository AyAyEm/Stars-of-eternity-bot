import { EternityCommand, EternityMessage, EternityCommandOptions } from '@lib';
import { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<EternityCommandOptions>({
  preconditions: ['OwnerOnly'],
  requiredArgs: ['number'],
})
export default class extends EternityCommand {
  public async run(msg: EternityMessage, args: Args) {
    const ammount = await args.pick('number');

    if (ammount >= 100) {
      msg.replyTranslated('commands/purge:exceededLimit');
    } else {
      msg.channel.bulkDelete(Number(ammount) + 1)
        .catch((err: Error) => msg.sendTranslated('commands/purge:error', [{ err: err.message }]));
    }
  }
}
