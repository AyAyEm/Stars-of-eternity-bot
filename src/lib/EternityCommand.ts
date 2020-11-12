import {
  Command, PieceContext, CommandOptions,
} from '@sapphire/framework';
import { CommandError } from '@lib';
import { list } from '@root/lib/utils/LanguageFunctions';
import * as async from 'async';

import type { Args, ArgType } from '@sapphire/framework';
import type { EternityMessage } from '@lib';
import type { EternityClient } from './EternityClient';

export interface EternityCommandOptions extends CommandOptions {
  requiredArgs?: Array<keyof ArgType>;
}

export abstract class EternityCommand extends Command {
  public requiredArgs: EternityCommandOptions['requiredArgs'];

  protected constructor(context: PieceContext, options: EternityCommandOptions) {
    super(context, options);
    this.requiredArgs = options.requiredArgs ?? [];
  }

  public get client(): EternityClient {
    return super.client as EternityClient;
  }

  public error = (type: string, message: string) => new CommandError(type, message);

  public async verifyArgs(args: Args, message: EternityMessage) {
    const missingArguments = await async.filter(this.requiredArgs, async (arg) => !(
      await args.pickResult(arg)).success);

    if (missingArguments.length > 0) {
      message.sendTranslated('missingArgument', [{ args: missingArguments }]);
      throw this.error('missingArgument',
        `The argument(s) ${list(missingArguments, 'and')} was missing.`);
    }

    return args.start();
  }

  public async preParse(message: EternityMessage, parameters: string) {
    const args = await super.preParse(message, parameters);
    if (this.requiredArgs.length > 0) return this.verifyArgs(args, message);
    return args;
  }
}
