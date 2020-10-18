import { Task } from 'klasa';
import axios from 'axios';

import type { TaskStore } from 'klasa';
import type { Fissure } from '../../../types/WFCD';

const fissuresUrl = 'https://api.warframestat.us/pc/fissures';

export default class extends Task {
  constructor(...args: [TaskStore, string[], string]) {
    super(...args, { enabled: true });
  }

  async init() {
    const runner = async () => {
      axios.get(fissuresUrl).then(async ({ data: fissuresData }: { data: Fissure[] }) => {
        const provider = this.client.providers.get('mongoose');

        const activeFissures = fissuresData.filter(({ active }) => active);
        const fissureTracker = await (provider as any).Tracker('fissure', 'warframe');
        const fissuresIDs = fissureTracker.get('data.cacheIDs', []);

        const needUpdate = activeFissures.some((fissure) => !fissuresIDs.includes(fissure.id));
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

  run() { }
}
