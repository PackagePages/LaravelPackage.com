# Service Providers

An essential part of a package is its **Service Provider**. Before creating our own, I’ll try to explain what service providers are about in this section first. If you are familiar with the service providers, please continue to the next section.

As you might know, Laravel comes with a series of service providers, namely the `AppServiceProvider`, `AuthServiceProvider`, `BroadcastServiceProvider`, `EventServiceProvider` and `RouteServiceProvider`. These providers take care of “bootstrapping” (or “registering”) application specific services (as service container bindings), event listeners, middleware and routes.

Every service provider extends the `Illuminate\Support\ServiceProvider` and implements a `register()` and a `boot()` method.

The `boot()` method is used to bind things in the service container. After all other service providers have been registered (i.e. all register() methods of all service providers were called, including third-party packages), Laravel will call the boot() method on all service providers.

In the `register()` method, you might for example register a class binding in the service container, enabling a class to be resolved from the container. However, sometimes you will need to reference another class, in which case the `boot()` can be used.

Here is an example of how a service provider may look and which things you might implement in a `register()` and `boot()` method.

```php
use App\Calculator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
  public function register()
  {
    // Register a class in the service container
    $this->app->bind('calculator', function ($app) {
      return new Calculator();
    });
  }

  public function boot()
  {
    // Register a macro, extending the Illuminate\Collection class
    Collection::macro('rejectEmptyFields', function () {
      return $this->reject(function ($entry) {
        return $entry === null;
       });
    });

    // Register an authorization policy
    Gate::define('delete-post', function ($user, $post) {
      return $user->is($post->author);
    });
  }
}
```

## Adding our package's service provider
For our package, we will create our own service provider which contains specific information about the core of what our package has to offer. The package might use a config file, maybe some views, routes, controllers, database migrations, model factories, custom commands, etc. The service provider needs to **register** them. We will discuss each of these in subsequent chapters.

Since we’ve pulled in Orchestra Testbench, we can extend the `Illuminate\Support\ServiceProvider` and create our own service provider in the `src/` directory as shown (replace naming with your own details):

```php
// 'src/BlogPackageServiceProvider.php'
<?php

namespace JohnDoe\BlogPackage;

use Illuminate\Support\ServiceProvider;

class BlogServiceProvider extends ServiceProvider
{
  public function register()
  {
    //
  }

  public function boot()
  {
    //
  }
}
```

## Autoloading
To automatically register it with a Laravel project using Laravel’s package auto-discovery we add our service provider to the “extra” > “laravel” > “providers” key in our package's `composer.json`:

```json
{
  ...,

  "autoload": { ... },

  "extra": {
      "laravel": {
          "providers": [
              "JohnDoe\\BlogPackage\\BlogPackageServiceProvider"
          ]
      }
  }
}
```

Now, whenever someone includes our package, the service provider will be loaded and everything we’ve registered will be available in the application. Now let’s see what we might want to register in this service provider.
