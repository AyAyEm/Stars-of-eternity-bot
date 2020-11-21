export class MultiEntryMap<Key, Value> extends Map<Key, Value> {
  constructor(entries: [Key[], Value][]) {
    super();
    entries.forEach(([keys, value]) => keys.forEach((key) => this.set(key, value)));
  }
}

export default MultiEntryMap;
