const { Task } = require('klasa');
const { some, filter } = require('async');
const axios = require('axios').default;

const fissuresUrl = 'https://api.warframestat.us/pc/fissures';

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async init() {
    const runner = async () => {
      axios.get(fissuresUrl).then(async ({ data: fissuresData }) => {
        const activeFissures = await filter(fissuresData, async ({ active }) => active);
        const fissureTracker = await this.client.provider.Tracker('fissure', 'warframe');
        const fissuresIDs = fissureTracker.get('data.cacheIDs', []);
        const needUpdate = await some(activeFissures, async (fissure) => (
          !fissuresIDs.includes(fissure.id)
        ));
        if (needUpdate) {
          this.client.emit('warframeNewFissure', activeFissures);
          const updatedArr = fissuresData.map(({ id }) => id);
          await fissureTracker.set('data.cacheIDs', updatedArr);
        }
      })
        .catch((err) => {
          if (err.message.includes('Request failed')) return;
          this.client.console.error(err);
        });
    };
    setInterval(runner, 10000);
  }
};
