import { EternityEvent } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@sapphire/framework';

import type { EventOptions, CommandErrorPayload } from '@sapphire/framework';
import type { CommandError } from '@lib/errors';

type PossibleErrors = Error | CommandError | unknown;

@ApplyOptions<EventOptions>({ event: Events.CommandError })
export default class extends EternityEvent<Events.CommandError> {
  public run(error: PossibleErrors, { message }: CommandErrorPayload) {
    if (typeof error !== 'object') return;
    if ((error as CommandError).name === 'CommandError') {
      const { langPath } = error as CommandError;
      message.sendTranslated(langPath);
    }
  }
}
