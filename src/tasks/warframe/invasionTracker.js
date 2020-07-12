const { Task, KlasaConsole } = require('klasa');

const invasionUrl = 'https://api.warframestat.us/pc/invasions';
const axios = require('axios').default;

module.exports = class extends Task {
  constructor(...args) {
    super(...args, {
      name: 'invasionTracker',
      enabled: true,
    });
  }

  async init() {
    const runner = async () => {
      axios.get(invasionUrl).then(async ({ data: invasionsData }) => {
        const provider = await this.client.providers.get('mongoose');
        const invasionDocument = await provider.warframe.invasion;
        const invasionsIds = await invasionDocument.get('data.cacheIds') || [];
        const needUpdate = invasionsData.reduce((boolean, invasion) => {
          if (!invasionsIds.includes(invasion.id) && !invasion.completed) {
            this.client.emit('warframeNewInvasion', invasion);
            return true;
          }
          return boolean;
        }, false);
        if (needUpdate) {
          const updatedArr = invasionsData.map((invasion) => invasion.id);
          invasionDocument.set('data.cacheIds', updatedArr);
          await invasionDocument.save();
        }
      })
        .catch((err) => KlasaConsole.error(err));
    };
    setInterval(runner, 10000);
  }
};
