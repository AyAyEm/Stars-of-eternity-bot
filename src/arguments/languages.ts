import { MultiArgument } from 'klasa';

import type { ArgumentStore } from 'klasa';

export default class extends MultiArgument {
  constructor(...args: [ArgumentStore, string[], string]) {
    super(...args, { aliases: ['...language'] });
  }

  get base() {
    return this.store.get('language');
  }
}
