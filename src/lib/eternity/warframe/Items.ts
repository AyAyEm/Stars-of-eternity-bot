import axios from 'axios';
import _ from 'lodash';
import async from 'async';
import fse from 'fs-extra';
import path from 'path';

import type { Item } from 'warframe-items';
import type { Awaited } from '@sapphire/framework';

import Root = require('app-root-path');

export class Items {
  public readonly dir = path.join(Root.path, 'data\\warframe-items');

  public readonly source = 'https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/All.json';

  private _uniqueNameDict: Record<string, string>;

  public latestUpdate?: Date;

  get uniqueNameDict(): Awaited<Record<string, string>> {
    if (!this._uniqueNameDict) {
      const result = import(`${this.dir}.json`);
      result.then((uniqueNameDict: Record<string, string>) => {
        this._uniqueNameDict = uniqueNameDict;
      });

      return result;
    }
    return this._uniqueNameDict;
  }

  public async create() {
    const { data }: { data: Item[] } = await axios.get(this.source);

    const dataDict = _.fromPairs(_.map(data, ({ name, uniqueName }) => (
      [name.toLowerCase(), uniqueName])));

    this._uniqueNameDict = dataDict;
    fse.outputJson(`${this.dir}.json`, dataDict);

    const operations = data.map((item) => async () => (
      fse.outputJson(path.join(this.dir, `${item.uniqueName}.json`), item)));

    async.parallelLimit(operations, 64);
    this.latestUpdate = new Date();
  }

  public async get(name: string, createIfNotExists = false): Promise<Item | null> {
    const uniqueNameDict = await this.uniqueNameDict;
    if (!this.uniqueNameDict && createIfNotExists) await this.create();
    else if (!uniqueNameDict && !createIfNotExists) return null;

    return import(path.join(this.dir, uniqueNameDict[name.toLowerCase()]));
  }
}
