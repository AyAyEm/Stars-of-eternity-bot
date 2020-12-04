const lowerCase = <T>(key: T): T => (typeof key === 'string' ? key.toLowerCase() : key) as T;

/**
 * Map designed to work with keys case being insensitive.
 */
export class CIMap<K, V> extends Map<K, V> {
  #dictionary: Map<K, K> = new Map();

  public constructor(entries: [K, V][] = []) {
    super();

    entries.forEach(([key, value]) => this.set(key, value));
  }

  public clear() {
    this.#dictionary.clear();
    return super.clear();
  }

  public delete(key: K) {
    const parsedKey = this.#dictionary.get(lowerCase(key));
    this.#dictionary.delete(key);
    return super.delete(parsedKey);
  }

  public get(key: K): V {
    const parsedKey = this.#dictionary.get(lowerCase(key));
    return super.get(parsedKey);
  }

  public has(key: K) {
    const parsedKey = this.#dictionary.get(lowerCase(key));
    return super.has(parsedKey);
  }

  public set(key: K, value: V): this {
    this.#dictionary.set(lowerCase(key), key);
    return super.set(key, value);
  }
}
