import { Argument } from 'klasa';

import type { Possible, KlasaMessage } from 'klasa';

export default class extends Argument {
  run(arg: string, possible: Possible, message: KlasaMessage) {
    const language = this.client.languages.get(arg);
    if (language) return language;
    throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'language');
  }
}
