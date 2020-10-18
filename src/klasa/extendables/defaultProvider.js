const { Extendable, KlasaClient } = require('klasa');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [KlasaClient],
    });
  }

  get provider() {
    return this.providers.get('mongoose');
  }
};
