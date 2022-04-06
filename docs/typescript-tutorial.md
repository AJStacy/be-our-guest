# TypeScript Tutorial

For the purposes of this tutorial, let's say we want to register an ApiWrapper module and an
ApiComponent module that requires an instance of the ApiWrapper into our service container.

## Step 1: Instantiate the Service Container

```typescript
// services.ts
import { Registry, Services, ServiceProvider } from 'be-our-guest';

// Import the services you want to provide
import { ApiWrapper } from './somewhere/ApiWrapper';
import { ApiComponent } from './somewhere/ApiComponent';
import { OtherModule } from './somewhere/OtherModule';

// This interface describes each of your services
interface AppServicesRegistry extends Registry {
  /* When creating your registry type, the key of the type is what you will call when you want
     to get the service from the container. */
  apiWrapper: ApiWrapper;
  otherModule: OtherModule;

  /* If your service requires primitive arguments when registered you can write it like this.
     In this example, ApiComponent requires the user to provide a primitive value that is a number. */
  apiComponent: {
    type: ApiComponent;
    args: [number];
  };
}

// Next we'll create a convenient type alias for referencing our service container instance
export type AppServices = Services<AppServicesRegistry>;

// And we'll create a convenient type alias for our Service Providers
export type AppServiceProvider = ServiceProvider<AppServicesRegistry>;

// We'll instantiate our service container with our Registry type
export const services = new Services<AppServicesRegistry>();
```

## Step 2: Create Service Providers for your Container

In this step we will create a service provider for _ApiWrapper_. In this example, we want the same
instance of _ApiWrapper_ any time we retrieve it from the container. To do this we will use the
`singleton()` method on the service container.

### Example: ApiWrapper Provider (Singleton)

```typescript
// api-wrapper-provider.ts

// Import our AppServiceProvider and AppServices types we defined in step #1
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
// Import your service that you want to add
import { ApiWrapper } from './somewhere/ApiWrapper.ts';

export class ApiWrapperProvider implements AppServiceProvider {
  // All service providers must have a register method.
  public async register(services: AppServices) {
    /* We will bind this service to the container as a singleton. The first
       parameter, the service name, must match the key in your registry type. */
    await services.singleton('apiWrapper', async () => {
      // Construct your service.
      return new ApiWrapper('https://my.endpoint.io/api');
    });
  }

  // The boot method on a service provider is completely optional.
  public async boot(services: AppServices) {
    // ApiWrapper has an initialize method that we want to call at boot time.
    const apiWrapper = await services.get('apiWrapper');

    // Now we can run the initialize method that ApiWrapper requires at boot.
    await apiWrapper.initialize();
  }
}
```

### Example: ApiComponent Provider (Class)

Remember, the beauty of using an IoC service container is that management of dependency instantiation is handled for you.

In this example, _ApiComponent_ needs an instance of _ApiWrapper_ injected into it so that ApiComponent can use ApiWrapper's methods. ApiComponent also needs a primitive number value passed to it upon instantiation to declare the maximum timeout value for it's api requests. This is handled by args made available in the callback on the `bind()` method. The types are defined by the `Registry` type in step #1 above.

```typescript
// api-component-provider.ts

// Import our AppServiceProvider and AppServices types we defined in step #1
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
// Import your service that you want to add
import { ApiComponent } from './somewhere/ApiComponent.ts';

export class ApiComponentProvider implements AppServiceProvider {
  public async register(services: AppServices) {
    /* We will bind this service to the container as a class using the `bind()` method.
       When we retrieve this service later it will be a unique instance. Our ApiComponent
       also requires a request timeout value. We can access it by destructuring the provided
       args in the callback. The arg types are defined in the Registry type (above). */
    await services.bind('apiComponent', async ([timeout]) => {
      /* The ApiComponent service requires that you provide it with an instance of
         the ApiWrapper. To do this, we simply call `get()` on our service container. */
      return new ApiComponent(await services.get('apiWrapper'), timeout);
    });
  }

  /** We can omit the boot step because this service does not require it. **/
}
```

### Example: OtherModule Provider (Instance)

Occassionally you will have a dependency within your app that has been instantiated elsewhere. In these cases you can directly assign these instances to the service container by using the `instance()` method.

```typescript
// other-module-provider.ts

// Import our AppServiceProvider and AppServices types we defined in step #1
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
// Import your service that you want to add
import { OtherModule } from './somewhere/OtherModule.ts';

export class OtherModuleProvider implements AppServiceProvider {
  public async register(services: AppServices) {
    /* OtherModule was instantiated elsewhere in our app. We can add it to the service container
       by using the instance method. */
    await services.instance('otherModule', OtherModule);
  }
}
```

## Step 3: Add Service Provider to the Container

Now that we have created our service providers we must add them to the service container. The service container will begin registering and booting all of the providers once the `add()` method has been called and the providers have been passed into it.

```typescript
// main.ts

import { services } from './somewhere/services.ts';
import {
  ApiWrapperProvider,
  ApiComponentProvider,
  OtherModuleProvider,
} from './somewhere/providers.ts';

async function main() {
  /* We'll add the service providers to the container and voila! We have a service container
    with all of our services available! The order in which they are added here does not matter. */
  await services.add([ApiWrapperProvider, ApiComponentProvider, OtherModuleProvider]);

  // Continue with the rest of our app...
}
```

## Step 4: Use the Service Container

Now that our service container is filled with services we can use it throughout our codebase! All
services are instantiated, injected, and booted asynchronously and in the correct order automatically!

```typescript
import { services } from './somewhere/services.ts';

async function myFunc() {
  // Get our service
  const apiComponent = await services.get('apiComponent', 500);

  // Use our service
  const response = await apiComponent.apiCall();

  // Yay!
}
```

---

## Putting it All Together

Here's an overview without all of the comments.

### services.ts

```typescript
import { Registry, Services, ServiceProvider } from 'be-our-guest';
import { ApiWrapper } from './somewhere/ApiWrapper';
import { ApiComponent } from './somewhere/ApiComponent';
import { OtherModule } from './somewhere/OtherModule';

interface AppServicesRegistry extends Registry {
  apiWrapper: ApiWrapper;
  otherModule: OtherModule;
  apiComponent: {
    type: ApiComponent;
    args: [number];
  };
}

export type AppServices = Services<MyServicesRegistry>;
export type AppServiceProvider = ServiceProvider<MyServicesRegistry>;
export const services = new Services<AppServicesRegistry>();
```

### api-wrapper-provider.ts

```typescript
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
import { ApiWrapper } from './somewhere/ApiWrapper.ts';

export class ApiWrapperProvider implements AppServiceProvider {
  public async register(services: AppServices) {
    services.singleton('apiWrapper', async () => {
      // Construct your service.
      return new ApiWrapper('https://my.endpoint.io/api');
    });
  }

  public async boot(services: AppServices) {
    const apiWrapper = await services.get('apiWrapper');
    await apiWrapper.initialize();
  }
}
```

### api-component-provider.ts

```typescript
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
import { ApiComponent } from './somewhere/ApiComponent.ts';

export class ApiComponentProvider implements AppServiceProvider {
  public async register(services: AppServices) {
    services.bind('apiComponent', async ([timeout]) => {
      return new ApiComponent(await services.get('apiWrapper'), timeout);
    });
  }
}
```

### other-module-provider.ts

```typescript
import { AppServiceProvider, AppServices } from './somewhere/services.ts';
import { OtherModule } from './somewhere/OtherModule.ts';

export class OtherModuleProvider implements AppServiceProvider {
  public async register(services: AppServices) {
    services.instance('otherModule', OtherModule);
  }
}
```

### main.ts

> The main place our app boots (varies by framework).

```typescript
import { services } from './somewhere/services.ts';
import {
  ApiWrapperProvider,
  ApiComponentProvider,
  OtherModuleProvider,
} from './somewhere/providers.ts';

async function main() {
  await services.add([ApiWrapperProvider, ApiComponentProvider, OtherModuleProvider]);

  // continue with the rest of our app...
}
```

### elsewhere.ts

> Example of using our service in the app.

```typescript
import { services } from './somewhere/services.ts';

async function myFunc() {
  const apiComponent = await services.get('apiComponent', 500);
  const response = await apiComponent.apiCall();
}
```
