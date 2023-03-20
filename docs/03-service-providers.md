---
title: "Service Providers"
description: "The Service Provider of a package is essential to register package-specific functionality. This section will cover the role and basics of a Service Provider and explains how to create and use a Service Provider for your package."
tags: ["Service Provider"]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2019-09-17
---

# Service Providers

An essential part of a package is its **Service Provider**. Before creating our own, I'll explain what service providers are about in this section first. If you are familiar with the service providers, please continue to the next section.

As you might know, Laravel comes with a series of service providers, namely the `AppServiceProvider`, `AuthServiceProvider`, `BroadcastServiceProvider`, `EventServiceProvider` and `RouteServiceProvider`. These providers take care of "bootstrapping" (or "registering") application-specific services (as service container bindings), event listeners, middleware, and routes.

Every service provider extends the `Illuminate\Support\ServiceProvider` and implements a `register()` and a `boot()` method.

The `boot()` method is used to bind things in the service container. After all other service providers have been registered (i.e., all `register()` methods of all service providers were called, including third-party packages), Laravel will call the boot() method on all service providers.

In the `register()` method, you might register a class binding in the service container, enabling a class to be resolved from the container. However, sometimes you will need to reference another class, in which case the `boot()` method can be used.

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

## Creating a Service Provider

We will create a service provider for our package, which contains specific information about our package's core. The package might use a config file, maybe some views, routes, controllers, database migrations, model factories, custom commands, etc. The service provider needs to **register** them. We will discuss each of these in subsequent chapters.

Since we've pulled in Orchestra Testbench, we can extend the `Illuminate\Support\ServiceProvider` and create our service provider in the `src/` directory as shown (replace naming with your details):

```php
// 'src/BlogPackageServiceProvider.php'
<?php

namespace JohnDoe\BlogPackage;

use Illuminate\Support\ServiceProvider;

class BlogPackageServiceProvider extends ServiceProvider
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

To automatically register it with a Laravel project using Laravel's package auto-discovery we add our service provider to the "extra"> "laravel"> "providers" key in our package's `composer.json`:

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

Now, whenever someone includes our package, the service provider will be loaded, and everything we've registered will be available in the application. Now let's see what we might want to register in this service provider.

**Important**: this feature is available starting from Laravel 5.5. With version 5.4 or below, you must register your service providers manually in the providers section of the `config/app.php` configuration file in your laravel project.

```php
// 'config/app.php'
<?php

'providers' => [
    // Other Service Providers

    App\Providers\ComposerServiceProvider::class,
],
```
