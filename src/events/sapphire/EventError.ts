import { EternityEvent, CommandError } from '@lib';
import { Events, ArgumentError } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import type { EventOptions } from '@sapphire/framework';

type PossibleErrors = ArgumentError<unknown> | CommandError | Error;

@ApplyOptions<EventOptions>({ event: Events.EventError })
export default class extends EternityEvent<Events.EventError> {
  public async run(error: PossibleErrors) {
    if (error instanceof CommandError && error.identifier === 'missingArgument') return;
    if (error instanceof ArgumentError) {
      this.client.console.error(error);
    } else {
      this.client.console.log(error);
    }
  }
}
