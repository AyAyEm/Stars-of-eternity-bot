import axios from 'axios';
import * as _ from 'lodash';
import * as async from 'async';
import * as fse from 'fs-extra';
import * as path from 'path';

import type { Item } from 'warframe-items';

import Root = require('app-root-path');

export class Items {
  public readonly dir = path.join(Root.path, 'data\\warframe-items');

  public readonly source = 'https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/All.json';

  public uniqueNameDict?: Record<string, string>;

  public latestUpdate?: Date;

  public async create() {
    const { data }: { data: Item[] } = await axios.get(this.source);

    const dataDict = _.fromPairs(_.map(data, ({ name, uniqueName }) => (
      [name.toLowerCase(), uniqueName])));

    this.uniqueNameDict = dataDict;
    fse.outputJson(`${this.dir}.json`, dataDict);

    const operations = data.map((item) => async () => (
      fse.outputJson(path.join(this.dir, `${item.uniqueName}.json`), item)));

    async.parallelLimit(operations, 64);
    this.latestUpdate = new Date();
  }

  public async get(name: string, createIfNotExists = false): Promise<Item | null> {
    const uniqueNameDict = this.uniqueNameDict || await import(`${this.dir}.json`);
    if (!this.uniqueNameDict && createIfNotExists) await this.create();
    else if (!uniqueNameDict && !createIfNotExists) return null;

    if (!this.uniqueNameDict && !!uniqueNameDict) this.uniqueNameDict = uniqueNameDict;

    return import(path.join(this.dir, uniqueNameDict[name.toLowerCase()]));
  }
}
