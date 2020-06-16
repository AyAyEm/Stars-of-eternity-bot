const { Extendable } = require('klasa');

const invasionUrl = 'https://api.warframestat.us/pc/invasions';
const axios = require('axios').default;

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [],
    });
  }

  get provider() {
    return this.client.providers.get('mongodb');
  }

  async init() {
    const run = async () => {
      const provider = await this.provider;
      const { data: invasionsData } = await axios.get(invasionUrl);
      const invasionsIds = provider.trackers.invasions;
      const needUpdate = invasionsData.reduce((boolean, invasion) => {
        if (!invasionsIds.includes(invasion.id) && !invasion.completed) {
          this.client.emit('warframeNewInvasion', invasion);
          return true;
        }
        return boolean;
      }, false);
      if (needUpdate) {
        const updatedArr = invasionsData.map((invasion) => invasion.id);
        provider.trackers.updateInvasion(updatedArr);
      }
    };
    setInterval(run, 5000);
  }
};
