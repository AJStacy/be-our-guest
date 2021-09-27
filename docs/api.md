# Api Documentation

In this document we describe the API of the **Be Our Guest** service container. Use this as a quick reference.

---

## Services

`Services` is the service container prototype that provides you with a service container when instantiated.

```typescript
import { Services } from 'be-our-guest';
import { AppRegistry } from 'app-registry.ts';

export const services = new Services<AppRegistry>();
```

### LogOverrides

When using the service container it will generate a few console logs. Be Our Guest provides a simple interface for overriding the behavior of the logs that are generated through a LogOverrides configuration object that can be provided to `Services` when you construct it.

#### LogOverrides Type Interface

```typescript
type LogFunc = (...args: unknown[]) => void;

export interface LogOverrides {
  suppress: boolean;
  info?: LogFunc;
  error?: LogFunc;
}
```

#### LogOverrides Example

```typescript
import { Services, LogOverrides } from 'be-our-guest';
import { AppRegistry } from 'app-registry.ts';

export const services = new Services<AppRegistry>();
```

### bind

The `bind()` method registers a service as a class that returns a new instance whenever the user calls `get()` for the named service.

#### bind Interface

- [DepDef Type](#depdef-type)
- [DepArgs Type](#depargs-type)

```typescript
class Services {
  public async bind<Name extends keyof Ds>(name: Name, cb: Callback<DepDef<Ds, Name>, DepArgs<Ds, Name>>): Promise<void>;
}
```

#### bind Example

This should only be used within a Service Provider construct.

```typescript
import { Services, ServiceProvider } from 'be-our-guest';
import { AppRegistry } from './app-registry.ts';
import MyService from './my-service.ts';

class ExampleServiceProvider implements ServiceProvider<AppRegistry> {
  public async register(services: Services<AppRegistry>) {
    await services.bind('myService', async ([ arg1, arg2 ]) => {
      return new MyService(await services.get('otherService'), arg1, arg2);
    });
  }
}
```

### singleton

The `singleton()` method registers a service that returns a the same instance whenever the user calls `get()` for the named service.

#### singleton Interface

- [DepDef Type](#depdef-type)
- [DepArgs Type](#depargs-type)

```typescript
class Services {
  public async singleton<Name extends keyof Ds>(name: Name, cb: Callback<DepDef<Ds, Name>, DepArgs<Ds, Name>>): Promise<void>;
}
```

#### singleton Example

This should only be used within a [Service Provider](#service-provider) construct.

```typescript
import { Services, ServiceProvider } from 'be-our-guest';
import { AppRegistry } from './app-registry.ts';
import MyService from './my-service.ts';

class ExampleServiceProvider implements ServiceProvider<AppRegistry> {
  public async register(services: Services<AppRegistry>) {
    await services.singleton('myService', async () => {
      return new MyService('test', 123);
    });
  }
}
```

### instance

The `instance()` method registers a service that has already been instantiated elsewhere in your app.

#### instance Interface

- [DepDef Type](#depdef-type)

```typescript
class Services {
  public async instance<Name extends keyof Ds>(name: Name, dependency: DepDef<Ds, Name>): Promise<void>;
}
```

#### instance Example

This should only be used within a [Service Provider](#service-provider) construct.

```typescript
import { Services, ServiceProvider } from 'be-our-guest';
import { AppRegistry } from './app-registry.ts';
import MyServiceInstance from './my-service.ts';

class ExampleServiceProvider implements ServiceProvider<AppRegistry> {
  public async register(services: Services<AppRegistry>) {
    await services.instance('myService', MyServiceInstance);
  }
}
```

### add

The `add()` method adds Service Providers to the service container and kicks off the registration and boot process.

#### add Interface

```typescript
class Services {
  public async add(service_providers: Array<ServiceProviderConstructor<Ds>>): Promise<void>;
}
```

#### add Example

```typescript
import { services } from './my-services';
import { ExampleServiceProvider, AnotherServiceProvider } from './service-providers';

// The entry point for your application
async function main() {
  await services.add([ ExampleServiceProvider, AnotherServiceProvider ]);

  // continue with your app...
}
```

### get

The `get()` method retrieves a service by its key from the service container and passes any required arguments defined by the [Registry Type](#registry-type).

#### get Interface

```typescript
class Services {
  public async get(service_providers: Array<ServiceProviderConstructor<Ds>>): Promise<void>;
}
```

#### get Example

```typescript
import { services } from './my-services';
import { ExampleServiceProvider, AnotherServiceProvider } from './service-providers';

// The entry point for your application
async function main() {
  await services.add([ ExampleServiceProvider, AnotherServiceProvider ]);

  // continue with your app...
}
```

---

## Registry Type

The `Registry` type is a TypeScript interface that you extends to declare the types of the services within your service container.

### Registry Type Interface

```typescript
export interface Registry {
  [key: string]: unknown | TypeConfig;
}

interface TypeConfig {
  type: unknown;
  args: unknown[];
}
```

### Registry Type Example

```typescript
import { Registry } from 'be-our-guest';
import { MyServiceA, MyServiceB } from './services';

export interface AppRegistry extends Registry {
  myServiceA: MyServiceA;
  myServiceB: {
    type: MyServiceB;
    args: [ string, number ];
  };
}
```

---

## ServiceProvider Type

The `ServiceProvider` type provides type constraints to classes that are to be used as service providers. By creating a class that extends the ServiceProvider type you are guaranteeing your service provider methods are valid.

### ServiceProvider Type Interface

```typescript
/**
 * The constructor blueprint for a ServiceProvider.
 *
 * @param Ds      The list of dependencies that the service container will contain.
 */
export interface ServiceProviderConstructor<Ds extends Registry> {
  /**
   * Construct a new ServiceProvider.
   */
  new (): ServiceProvider<Ds>;
}

/**
 * The instance blueprint of a ServiceProvider.
 *
 * @param Ds      The list of dependencies that the service container will contain.
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
```

