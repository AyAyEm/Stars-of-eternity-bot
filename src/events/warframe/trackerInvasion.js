/* eslint-disable no-unused-vars */
const { Event } = require('klasa');
const invasionEmbed = require('../../embeds/warframe/invasionTracker');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      name: 'warframeNewInvasion',
      enabled: true,
      once: false,
    });
  }

  get provider() {
    return this.client.providers.get('mongodb');
  }

  async run(invasion) {
    const provider = await this.provider;
  }
};
