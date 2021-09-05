# TypeScript Usage Steps

For the purposes of this tutorial, let's say we want to register an ApiWrapper module and an
ApiComponent module that requires an instance of the ApiWrapper into our service container.

## Step 1: Instantiate the Service Container

```typescript
// services.ts
import { Registry, Services, ServiceProvider } from 'be-our-guest';

// Import the services you want to provide
import { ApiWrapper } from './somewhere/ApiWrapper';
import { ApiComponent } from './somewhere/ApiComponent';

// This interface describes each of your services
interface AppServicesRegistry extends Registry {
  /* When creating your registry type, the key of the type is what you will call when you want
     to get the service from the container. */
  apiWrapper: ApiWrapper;

  /* If your service requires primitive arguments when registered you can write it like this.
     In this example, ApiComponent requires the user to provide primitive values that are a string
     and a number. */
  apiComponent: {
    type: ApiComponent;
    args: [string, number];
  };
}

// Next we'll create a convenient type alias for referencing our service container instance
export type AppServices = Services<MyServicesRegistry>;

// And we'll create a convenient type alias for our Service Providers
export type AppServiceProvider = ServiceProvider<MyServicesRegistry>;

// We'll instantiate our service container with our Registry type
export const services = new Services<AppServicesRegistry>();
```

## Step 2: Create Service Providers for your Container

In this step we will create a service provider for _ApiWrapper_. In this example, we want the same
instance of _ApiWrapper_ any time we retrieve it from the container. To do this we will use the
`singleton()` method on the service container.

### Example: ApiWrapper Provider

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
    services.singleton('apiWrapper', async () => {
      // Construct your service.
      return new ApiWrapper('https://my.endpoint.io/api');
    });
  }

  // The boot method on a service provider is completely optional.
  public async boot(services: AppServices) {
    // ApiWrapper has an initialize method that we want to call at boot time.
    const apiWrapper = await services.get('apiWrapper');

    // Now we can run the initialize method that ApiWrapper requires at boot.
    await serviceA.initialize();
  }
}
```

### Example: ApiComponent Provider

Remember, the beauty of using an IoC service container is that management of dependency instantiation is handled for you.
In this example, ServiceB needs an instance of ServiceA injected into it so that ServiceB can use ServiceA's methods.

```typescript
```

## Step 3: Add Service Provider to the Container

Now that we have created our service providers we must add them to the service container. The service container will
begin registering and booting all of the providers once the `add()` method has been called and the providers have been
passed into it.

```typescript
// main.ts

import { services } from './somewhere/services.ts';
import { ServiceAProvider, ServiceBProvider } from './somewhere/providers.ts';

async function main() {
  /* We'll add the service providers to the container and voila! We have a service container
    with all of our services available! */
  await services.add([ServiceAProvider, ServiceBProvider]);

  // Continue with the rest of our app...
}
```

## Step 4: Use the Service Container

Now that our service container is filled with services we can use it throughout our codebase!

```typescript
import { services } from './somewhere/services.ts';

async function myFunc() {
  // Get our service
  const serviceB = await services.get('serviceB');

  // Use our service
  const response = await serviceB.apiCall();

  // Yay!
}
```
