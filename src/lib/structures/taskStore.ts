import { BaseStore } from '@sapphire/framework';

import type { EternityClient } from '@lib';

import { Task } from './Task';

export class TaskStore extends BaseStore<Task> {
  public constructor(client: EternityClient) {
    super(client, Task as any, { name: 'tasks' });
  }

  protected async insert(task: Task): Promise<Task> {
    if (!task.enabled) return task;

    this.set(task.name, task);
    this.onPostLoad(this, task);
    await task.onLoad();
    task.create();
    return task;
  }
}
