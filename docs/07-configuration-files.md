# Configuration Files

It is quite likely that your package allows configuration by the end user.

If you want to offer custom configuration options, create a new `config` directory in the root of the package and add a file called `config.php`, which returns an array of options.

```php
// 'config/config.php'
<?php

return [
  'posts_table' => 'posts',
  // other options...
];
```

## Merging Into the Existing Configuration

After registering the config file in the `register()` method of our service provider under a certain "key" ('blogpackage' in our demo), we can access the config values from the config helper by prefixing our "key" as follows: `config('blogpackage.posts_table')`.

```php
// 'BlogPackageServiceProvider.php'
public function register()
{﻿
  $this->mergeConfigFrom(__DIR__.'/../config/config.php', 'blogpackage');
}
```

## Exporting

To allow users to modify the default config values, we need to provide them with the option to export the config file. We can register all "publishables" within the `boot()` method of the package's service provider. Since we only want to offer this functionality whenever the package is booted from the console, we'll first check if the current app is running in the console. We'll register the publishable config file under the 'config' tag (the second parameter of the `$this->publishes()` function call).

```php
// 'BlogPackageServiceProvider.php'﻿
public function boot()
{﻿
  if ($this->app->runningInConsole()) {

    $this->publishes([
      __DIR__.'/../config/config.php' => config_path('blogpackage.php'),
    ], 'config');

  }
}
```

The config file can now be exported using the command listed below, creating a `blogpackage.php` file in the `/config` directory of the Laravel project in which the package was required.

```bash
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="config"
```
