import type { EternityCommand } from '@lib';

export class CommandError extends Error {
  public readonly name = 'CommandError';

  public readonly langPath: string;

  constructor(public langKey: string, command: EternityCommand) {
    super(`The command ${command.name} generated an error`);
    this.langPath = `commands:${command.name}.${langKey}`;
  }
}
