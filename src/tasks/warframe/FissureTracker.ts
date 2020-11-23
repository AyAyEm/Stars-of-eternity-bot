import { Task, TaskOptions } from '@lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';

import type { Fissure } from '@lib/types/Warframe';

@ApplyOptions<TaskOptions>({ time: 10000 })
export default class extends Task {
  public document = new this.client.provider.Trackers({ id: { tracker: 'fissure' } });

  public fissuresUrl = 'https://api.warframestat.us/pc/fissures';

  public async run() {
    axios.get(this.fissuresUrl).then(async ({ data: fissuresData }: { data: Fissure[] }) => {
      if (process.env.NODE_ENV !== 'production') await this.document.reload();

      const activeFissures = fissuresData.filter(({ active }) => active);

      const fissuresIds = await this.document.get<string[]>('data.cacheIds', []);

      const newFissures = activeFissures.filter((fissure) => !fissuresIds.includes(fissure.id));
      if (newFissures.length > 0) {
        // this.client.emit('warframeNewFissures', newFissures);
        this.client.emit('warframeNewActiveFissures', activeFissures);

        const updatedFissureIds = fissuresData.map(({ id }) => id);
        await this.document.set('data.cacheIds', updatedFissureIds);
      }
    })
      .catch((err) => {
        if (err.message.includes('Request failed')) return;
        console.error(err);
      });
  }
}
