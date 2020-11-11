import {
  Command, PieceContext, CommandOptions, ArgumentError,
} from '@sapphire/framework';
import { Message } from 'discord.js';

import type { Args, ArgType } from '@sapphire/framework';
import type { EternityClient } from './EternityClient';

import { CommandError } from './errors';

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

  public error = (langKey: string) => new CommandError(langKey, this);

  public async verifyArgs(args: Args) {
    await Promise.all(this.requiredArgs.map(async (arg) => {
      const { success } = await args.pickResult(arg);
      if (!success) {
        const argument = this.client.arguments.get(arg);
        throw new ArgumentError(argument, arg, 'missingRequiredArgument', `${arg} type was missing`);
      }
    }));

    return args.start();
  }

  public async preParse(message: Message, parameters: string) {
    const args = await super.preParse(message, parameters);
    if (this.requiredArgs.length > 0) return this.verifyArgs(args);
    return args;
  }
}
