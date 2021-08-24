import { ServiceProvider, ServiceProviderConstructor } from '.';
import { Log } from './Log';
import { LogOverrides, Registry, DepDef, DepArgs } from '~/_contracts';

export type Tags = Map<string, string[]>;
export type Callback<Ds extends Registry, Dep, Name extends keyof Ds> = (
  args: DepArgs<Ds, Name>
) => Promise<Dep>;

/**
 * A TypeScript native async friendly service container.
 *
 * @param CoreDs  Core Dependencies that all service providers need.
 * @param Ds      The list of dependencies that the service container will contain.
 */
export class Services<Ds extends Registry> {
  /**
   * Class used for logging information to the console. It also
   * allows for the end user to override the logging methods.
   */
  private log: Log;

  /**
   * Contains registered closures for instantiating class instances.
   */
  private classes: Map<
    keyof Ds,
    Callback<Ds, DepDef<Ds, keyof Ds>, keyof Ds>
  > = new Map();

  /**
   * Contains registered singleton callbacks.
   */
  private singletonCallbacks: Map<
    keyof Ds,
    Callback<Ds, DepDef<Ds, keyof Ds>, keyof Ds>
  > = new Map();

  /**
   * Contains the singletons that have already resolved from the callbacks.
   */
  private singletons: Map<keyof Ds, Promise<DepDef<Ds, keyof Ds>>> = new Map();

  /**
   * Accepts an object generic that contains any dependencies required for the defer step.
   *
   * @param Core          Core dependencies that the ServiceProvider needs during the defer step.
   * @param LogOverrides  Optional logging methods that override the defaults used by this library.
   */
  constructor(log_overrides?: LogOverrides) {
    this.log = new Log(log_overrides);
  }

  /**
   * Registers class composition closures to the service container. ya6kCYLBbx3q7Bu
   */
  public async bind<Name extends keyof Ds>(
    name: Name,
    cb: Callback<Ds, DepDef<Ds, Name>, keyof Ds>
  ): Promise<void> {
    this.classes.set(name, cb);
  }

  /**
   * Registers a class that should be instantiated as a singleton on the service container.
   */
  public async singleton<Name extends keyof Ds>(
    name: Name,
    cb: Callback<Ds, DepDef<Ds, Name>, keyof Ds>
  ): Promise<void> {
    this.singletonCallbacks.set(name, cb);
  }

  /**
   * Registers an instance on the service container.
   */
  public async instance<Name extends keyof Ds>(
    name: Name,
    dependency: DepDef<Ds, Name>
  ): Promise<void> {
    this.singletons.set(name, Promise.resolve(dependency));
  }

  /**
   * Gets a dependency from the service container registry.
   */
  public async get<Name extends keyof Ds>(
    name: Name,
    ...args: DepArgs<Ds, Name>
  ): Promise<DepDef<Ds, Name>> {
    if (this.classes.has(name)) {
      // If the name is a class, return it.
      return this.classesHandler(name, args);
    } else if (this.singletons.has(name)) {
      // If the singleton has already been queried, return it.
      return this.singletons.get(name) as Promise<DepDef<Ds, Name>>;
    }

    // Invoke the callback of the given singleton name and add it to the singletons map.
    const cb = this.singletonCallbacks.get(name);

    if (cb) {
      const promise = cb(args);
      this.singletons.set(name, promise);
      return promise as Promise<DepDef<Ds, Name>>;
    }

    this.log.error(
      `The requested service of ${name} does not exist in the container.`
    );
    return Promise.reject();
  }

  /**
   * If the requested dependency is a class, return the result of the closure.
   */
  private async classesHandler<Name extends keyof Ds>(
    name: Name,
    args: DepArgs<Ds, Name>
  ): Promise<DepDef<Ds, Name>> {
    const closure = this.classes.get(name) as Callback<
      Ds,
      DepDef<Ds, Name>,
      keyof Ds
    >;
    return await closure(args);
  }

  /**
   * Adds the service providers to the service container by instantiating
   * them, registering them, and booting them.
   */
  public async add(service_providers: Array<ServiceProviderConstructor<Ds>>) {
    const provider_instances = this.instantiateProviders(service_providers);
    const providers = await this.registerProviders(provider_instances);

    await this.bootProviders(await providers);
  }

  /**
   * Instantiates all of the provided service providers.
   */
  private instantiateProviders(
    service_providers: Array<ServiceProviderConstructor<Ds>>
  ): ServiceProvider<Ds>[] {
    return service_providers.reduce((acc, Provider) => {
      if (Provider.defer && Provider.defer()) {
        this.log.info(`Deferred loading of ${`${Provider}`.split(' ')[1]}.`);
        return acc;
      }

      return acc.concat([new Provider()]);
    }, [] as ServiceProvider<Ds>[]);
  }

  /**
   * Executes the register method on each provided service provider instance.
   */
  private async registerProviders(
    providers: ServiceProvider<Ds>[]
  ): Promise<ServiceProvider<Ds>[]> {
    return await Promise.all(
      providers.map(async provider => {
        if (provider.beforeRegister) {
          await provider.beforeRegister(this);
        }

        await provider.register(this);
        if (provider.afterRegister) {
          await provider.afterRegister(this);
        }

        return provider;
      })
    );
  }

  /**
   * Executes the boot method on each provided service provider instance.
   */
  private async bootProviders(providers: ServiceProvider<Ds>[]): Promise<void> {
    await Promise.all(
      providers.map(async provider => {
        try {
          if (provider.beforeBoot) {
            await provider.beforeBoot(this);
          }
          if (provider.boot) {
            await provider.boot(this);
          }
          if (provider.afterBoot) {
            await provider.afterBoot(this);
          }
        } catch (e) {
          this.log.error('Boot Failed', provider, e);
        }
      })
    );
  }
}
