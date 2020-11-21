import { mergeDefault } from '@sapphire/utilities';
import { Command, CommandOptions } from '@sapphire/framework';
import { list } from '@utils/LanguageFunctions';
import { CommandError } from '@lib';
import async from 'async';

import type { Args, Awaited, PieceContext, ArgType } from '@sapphire/framework';
import type { EternityMessage } from '@lib';
import type { EternityClient } from './EternityClient';

type CommandRun = (message: EternityMessage, args: Args) => Awaited<void>;

export interface EternityCommandWSCOptions extends CommandOptions {
  requiredArgs?: Map<string, Array<keyof ArgType>>;
  enableDefault?: boolean;
}

export abstract class EternityCommandWSC extends Command {
  public requiredArgs: EternityCommandWSCOptions['requiredArgs'];

  public defaultCommand = 'default';

  public abstract subCommands: { [key: string]: CommandRun } = {
    default() { },
  };

  public enableDefault: boolean;

  protected constructor(context: PieceContext, options: EternityCommandWSCOptions) {
    super(context, options);
    this.requiredArgs = mergeDefault(new Map([['default', []]]), options.requiredArgs);
    this.enableDefault = options.enableDefault ?? false;
  }

  public get client(): EternityClient {
    return super.client as EternityClient;
  }

  protected get subCommandsList() {
    const commandsList = Object.keys(this.subCommands);
    return this.enableDefault ? commandsList
      : commandsList.filter((commandName) => commandName !== 'default');
  }

  public async run(message: EternityMessage, args: Args) {
    const subCommand = await args.pickResult('string')
      .then((result) => {
        if (result.success && result.value in this.subCommands) {
          args.save();
          return result.value;
        }
        args.start();
        return this.defaultCommand;
      });

    // eslint-disable-next-line no-useless-catch
    try {
      this.subCommands[subCommand.toLowerCase()](message, args);
    } catch (e: unknown) {
      throw e;
    }
  }

  public error = (type: string, message: string) => new CommandError(type, message);

  public async preParse(message: EternityMessage, parameters: string) {
    const args = await super.preParse(message, parameters);
    if (this.requiredArgs.size > 0) await this.verifyArgs(args, message);
    return args.start();
  }

  public async verifyArgs(args: Args, message: EternityMessage) {
    const subCommand = await args.pickResult('string')
      .then((result) => (result.success ? result.value : this.defaultCommand));

    if (this.subCommandsList.includes(subCommand) || this.enableDefault) {
      const requiredArgs = this.requiredArgs.get(subCommand) ?? [];

      const missingArguments = await async.filterSeries(requiredArgs, async (arg) => (
        !(await args.pickResult(arg)).success));

      if (missingArguments.length > 0) {
        message.sendTranslated('missingArgument', [{ args: missingArguments }]);
        throw this.error('missingArgument',
          `The argument(s) ${list(missingArguments, 'and')} was missing.`);
      }
    } else {
      message.sendTranslated('missingSubCommand', [{ args: this.subCommandsList }]);
      throw this.error('missingSubCommand',
        `The subcommand ${list(this.subCommandsList, 'or')} was missing.`);
    }
    return args.start();
  }
}
