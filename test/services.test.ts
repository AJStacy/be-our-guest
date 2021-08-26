import { Services } from '../src';
import { ObjectA, ObjectB, Dependencies } from './data';

test('register a singleton class', async () => {
  const services = new Services<Dependencies>();

  services.singleton('objectA_singleton', async () => {
    return new ObjectA(5);
  });

  const object_a = await services.get('objectA_singleton');

  if (object_a instanceof ObjectA) {
    expect(object_a.returnMyNumber()).toBe(5);
  } else {
    throw new Error('object_a is not an instance of ObjectA');
  }
});

test('register a class with dependency on a singleton and instantiate it', async () => {
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

    expect(object_b.testProp === object_b2.testProp).toBeFalsy();
    expect(object_b.testProp).toBe(10);
    expect(object_b2.testProp).toBe(20);
  } else {
    throw new Error('object_b or object_b2 was not an instance of ObjectB');
  }
});

test('register an instance of a class', async () => {
  const services = new Services<Dependencies>();
  const object_a = new ObjectA(5);

  services.instance('objectA_singleton', object_a);
  const object_a_test = await services.get('objectA_singleton');

  if (object_a === object_a_test) {
    expect(object_a_test.returnMyNumber()).toBe(5);
  } else {
    throw new Error('object_a is not equivalent to object_a_test');
  }
});

test('register a class that requires arguments', async () => {
  const services = new Services<Dependencies>();

  services.bind('objectA', async ([num]) => {
    return new ObjectA(num);
  });

  const objectA = await services.get('objectA', 5);

  if (objectA) {
    expect(objectA.returnMyNumber()).toBe(5);
  } else {
    throw new Error('objectA is undefined');
  }
});
