import { Services } from '.';
import { Registry } from '~/_contracts';

/**
 * The constructor blueprint for a ServiceProvider.
 *
 * @param CoreDs  Core dependencies that the ServiceProvider needs during the defer step.
 * @param Ds      The list of dependencies that the service container will contain.
 * @param D       The Dependency type that you are registering.
 */
export interface ServiceProviderConstructor<Ds extends Registry> {
  /**
   * Construct a new ServiceProvider.
   */
  new (): ServiceProvider<Ds>;

  /**
   * This method is performed before the service is registered to determine if it should be loaded.
   */
  defer?: () => Promise<boolean>;
}

/**
 * The instance blueprint of a ServiceProvider.
 *
 * @param CoreDs  Core dependencies that the ServiceProvider needs during the defer step.
 * @param Ds      The list of dependencies that the service container will contain.
 * @param D       The Dependency type that you are registering.
 */
export interface ServiceProvider<Ds extends Registry> {
  /**
   * Register your dependencies with the service container here.
   */
  register: (services: Services<Ds>) => Promise<void>;

  /**
   * A hook that is executed before the register method.
   */
  beforeRegister?: (services: Services<Ds>) => Promise<void>;

  /**
   * A hook that is executed after the register method.
   */
  afterRegister?: (services: Services<Ds>) => Promise<void>;

  /**
   * Boot your services here. This method is executed after all services are registered.
   */
  boot?: (services: Services<Ds>) => Promise<void>;

  /**
   * A hook that is executed before the boot method.
   */
  beforeBoot?: (services: Services<Ds>) => Promise<void>;

  /**
   * A hook that is executed after the boot method.
   */
  afterBoot?: (services: Services<Ds>) => Promise<void>;
}
