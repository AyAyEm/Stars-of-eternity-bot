export type Filter = Record<string, any>;
export interface Query {
  model?: string;
  id: string | Record<string, any>;
}

export interface GetAllParams {
  path?: string,
  filter?: Filter
}

type SetResult = Provider | void;

export abstract class Provider {
  public abstract async get<T = any>(query: Query, path: string): Promise<T | null>;

  public abstract async set<T = any>(query: Query, path: string, value: T): Promise<SetResult>;

  public abstract async getAll<T = any>(model: string, options: GetAllParams): Promise<T[] | null>;
  // public abstract async setAll<T = any>(path: string, value: T, filter?: Filter): SetReturn<this>
}
