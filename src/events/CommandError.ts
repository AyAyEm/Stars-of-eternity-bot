import { CommandErrorPayload, Event, Events, PieceContext } from '@sapphire/framework';

import type { CommandError } from '@lib/errors';

type PossibleErrors = Error | CommandError | unknown;

export default class extends Event<Events.CommandError> {
  public constructor(context: PieceContext) {
    super(context, { event: Events.CommandError });
  }

  public run(error: PossibleErrors, { message }: CommandErrorPayload) {
    if (typeof error === 'object' && (error as Error).name === 'CommandError') {
      const { langPath } = error as CommandError;
      message.sendTranslated(langPath);
    }
  }
}
