import { EternityEvent, CommandError } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@sapphire/framework';

import type { EventOptions, CommandErrorPayload } from '@sapphire/framework';

type PossibleErrors = Error | CommandError | unknown;

@ApplyOptions<EventOptions>({ event: Events.CommandError })
export default class extends EternityEvent<Events.CommandError> {
  public run(error: PossibleErrors, { message, piece }: CommandErrorPayload) {
    if (error instanceof CommandError) {
      message.sendTranslated(`commands/${piece.name}:${error.identifier}`);
    } else {
      this.client.console.error(error);
    }
  }
}
