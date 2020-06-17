const { Task } = require('klasa');

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
      try {
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
            if (!invasionDocument.data) {
              invasionDocument.data = { cacheIds: updatedArr };
            } else {
              invasionDocument.data.cacheIds = updatedArr;
            }
            console.log(updatedArr);
            await invasionDocument.updateOne({ 'data.cacheIds': updatedArr });
          }
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error);
      }
    };
    setInterval(runner, 5000);
  }
};
