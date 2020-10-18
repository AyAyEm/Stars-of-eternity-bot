import { Task } from 'klasa';
import axios from 'axios';

import type { TaskStore } from 'klasa';
import type { InvasionData } from '../../../types/WFCD';

const invasionUrl = 'https://api.warframestat.us/pc/invasions';

export default class extends Task {
  constructor(...args: [TaskStore, string[], string]) {
    super(...args, {
      name: 'invasionTracker',
      enabled: true,
    });
  }

  async init() {
    const runner = async () => {
      axios.get(invasionUrl).then(async ({ data: invasionsData }: { data: InvasionData[] }) => {
        const provider = this.client.providers.get('mongoose');
        const activeInvasions = invasionsData
          .filter(({ completed }: { completed: boolean }) => !completed);

        const invasionTracker = await (provider as any).Tracker('invasion', 'warframe');
        const invasionsIDs = invasionTracker.get('data.cacheIDs', []);

        const needUpdate = activeInvasions
          .reduce((needToUpdate: boolean, invasion: InvasionData) => {
            if (!invasion.completed && !invasionsIDs.includes(invasion.id)) {
              this.client.emit('warframeNewInvasion', invasion);
              return true;
            }
            return needToUpdate;
          }, false);

        if (needUpdate) {
          const updatedArr = invasionsData.map(({ id }) => id);
          await invasionTracker.set('data.cacheIDs', updatedArr);
        }
      })
        .catch((err) => {
          if (err.message.includes('Request failed')) return;
          this.client.console.error(err);
        });
    };
    setInterval(runner, 10000);
  }

  run() { }
}
