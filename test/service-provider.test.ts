import {
  ObjectA,
  ObjectB,
  TestServices,
  TestProvider,
  Dependencies,
} from './data';
import { Services } from '../src';

test('register service providers and boot them', async () => {
  const services = new Services<Dependencies>();

  class ObjectAProvider implements TestProvider {
    public async beforeRegister() {
      // console.debug('Registering ObjectA...');
    }

    public async register(services: TestServices) {
      services.bind('objectA', async ([num]) => {
        return new ObjectA(num);
      });
    }

    public async afterRegister() {
      // console.debug('Registration of ObjectA completed.');
    }

    public async beforeBoot() {
      // console.debug('Booting ObjectA...');
    }

    public async boot(services: TestServices) {
      const objectA = await services.get('objectA', 8);
      expect(objectA.returnMyNumber()).toBe(8);
    }

    public async afterBoot() {
      // console.debug('ObjectA booting complete.');
    }
  }

  class ObjectBProvider implements TestProvider {
    public async beforeRegister() {
      // console.debug('Registering ObjectB...');
    }

    public async register(services: TestServices) {
      services.bind('objectB', async () => {
        return new ObjectB(await services.get('objectA', 8));
      });
    }

    public async afterRegister() {
      // console.debug('Registration of ObjectB completed.');
    }

    public async beforeBoot() {
      // console.debug('Booting ObjectB...');
    }

    public async boot(services: TestServices) {
      const objectB = await services.get('objectB');
      expect(objectB.addNumberToA(4)).toBe(12);
    }

    public async afterBoot() {
      // console.debug('ObjectB booting complete.');
    }
  }

  await services.add([ObjectAProvider, ObjectBProvider]);
});
