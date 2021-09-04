import { Services, Registry, ServiceProvider } from '../../src';
import { ObjectA, ObjectB } from '.';

export interface Dependencies extends Registry {
  objectA_singleton: ObjectA;
  objectA: {
    type: ObjectA;
    args: [number];
  };
  objectB: ObjectB;
  deferTest: { foo: 'bar' };
}

export type TestProvider = ServiceProvider<Dependencies>;
export type TestServices = Services<Dependencies>;
