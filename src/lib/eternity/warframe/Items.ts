import axios from 'axios';
import * as async from 'async';
import * as fse from 'fs-extra';
import * as path from 'path';

import type { Item } from 'warframe-items';

import Root = require('app-root-path');

export class Items {
  public dir = path.join(Root.path, 'data\\warframe-items');

  public readonly source = 'https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/All.json';

  public uniqueNameDict?: Record<string, string>;

  public async create() {
    const { data }: { data: Item[] } = await axios.get(this.source);

    const dataDict = Object.fromEntries(data.map(({ name, uniqueName }) => (
      [name.toLowerCase(), uniqueName])));
    this.uniqueNameDict = dataDict;
    fse.outputJson(`${this.dir}.json`, dataDict);

    const operations = data.map((item) => async () => (
      fse.outputJson(path.join(this.dir, `${item.uniqueName}.json`), item)));

    async.parallelLimit(operations, 64);
  }

  public async get(name: string) {
    const uniqueNameDict: string = this.uniqueNameDict
      ? this.uniqueNameDict
      : this.uniqueNameDict = (await import(`${this.dir}.json`));

    return import(path.join(this.dir, uniqueNameDict[name.toLowerCase()]));
  }
}
