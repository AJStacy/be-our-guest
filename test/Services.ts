import test from 'ava';
import { Services, Registry } from '../src';
import { ObjectA, ObjectB } from './data';

interface Dependencies extends Registry {
  objectA_singleton: ObjectA;
  objectA: {
    type: ObjectA;
    args: [number];
  };
  objectB: ObjectB;
}

test('Register a singleton class', async t => {
  const services = new Services<Dependencies>();

  services.singleton('objectA_singleton', async () => {
    return new ObjectA(5);
  });

  // ---- testing -----
  const objectA = await services.get('objectA', 5);

  const object_a = await services.get('objectA_singleton');

  if (object_a instanceof ObjectA) {
    t.is(object_a.returnMyNumber(), 5);
  } else {
    t.fail('object_a is not an instance of ObjectA');
  }
});

test('Register a class with dependency on a singleton and instantiate it', async t => {
  const services = new Services<Dependencies>();

  services.singleton('objectA_singleton', async () => {
    return new ObjectA(5);
  });

  services.bind('objectB', async () => {
    return new ObjectB(await services.get('objectA_singleton'));
  });

  const object_b = await services.get('objectB');
  const object_b2 = await services.get('objectB');

  if (object_b instanceof ObjectB && object_b2 instanceof ObjectB) {
    object_b.testProp = 10;
    object_b2.testProp = 20;

    t.falsy(object_b.testProp === object_b2.testProp);
    t.is(object_b.testProp, 10);
    t.is(object_b2.testProp, 20);
  } else {
    t.fail();
  }
});

test('Register an instance of a class', async t => {
  const services = new Services<Dependencies>();
  const object_a = new ObjectA(5);

  services.instance('objectA_singleton', object_a);
  const object_a_test = await services.get('objectA_singleton');

  if (object_a === object_a_test) {
    t.is(object_a_test.returnMyNumber(), 5);
  } else {
    t.fail();
  }
});
