const { Task } = require('klasa');
const axios = require('axios').default;
const { reduce, filter } = require('async');

const invasionUrl = 'https://api.warframestat.us/pc/invasions';

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
        const activeInvasions = await filter(invasionsData, async ({ completed }) => !completed);
        const invasionTracker = await this.client.provider.Tracker('invasion', 'warframe');
        const invasionsIDs = invasionTracker.get('data.cacheIDs', []);
        const needUpdate = await reduce(activeInvasions, false, async (needToUpdate, invasion) => {
          if (!invasion.completed && !invasionsIDs.includes(invasion.id)) {
            this.client.emit('warframeNewInvasion', invasion);
            return true;
          }
          return needToUpdate;
        });
        if (needUpdate) {
          const updatedArr = invasionsData.map(({ id }) => id);
          await invasionTracker.set('data.cacheIDs', updatedArr);
        }
      })
        .catch((err) => {
          if (err.includes('Request failed')) return;
          this.client.console.error(err);
        });
    };
    setInterval(runner, 10000);
  }
};
