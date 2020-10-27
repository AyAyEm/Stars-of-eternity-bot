import { BaseStore } from '@sapphire/framework';

import type { EternityClient } from '@lib';

import { Task } from './Task';

export class TaskStore extends BaseStore<Task> {
  public constructor(client: EternityClient) {
    super(client, Task as any, { name: 'tasks' });
  }
}
