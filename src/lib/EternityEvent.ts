import { Event } from '@sapphire/framework';
import { EternityClient } from './EternityClient';

export abstract class EternityEvent<E extends string | number | symbol = ''> extends Event<E> {
  public get client(): EternityClient {
    return super.client as EternityClient;
  }
}
