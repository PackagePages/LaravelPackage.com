# How packages work
Packages or “libraries” provide an easy way to add additional functionality to existing applications, and are mostly focused on a single feature.

Packages are downloaded and installed using **Composer** - PHP’s package management system - which manages dependencies within a project.

To install a package in your existing Laravel project, the `composer require <vendor>/<package>` command will download all necessary files into the `/vendor` directory of your project where all your third party packages live, separated by vendor name. As a consequence, the content from these packages is separated from your application code which means this piece of code is maintained by someone else, most often by creator of that package. Whenever the package needs an update, run `composer update` to get the latest (compatible) version of your packages.

# The concept of autoloading
After each installation or update, composer will generate an `autoload.php` file in the `/vendor` directory. By including this single file, you’ll be able to access all classes provided by your installed libraries.

Looking at a Laravel project, you’ll see that the `index.php` file in the application root (which handles all incoming requests) requires the autoloader, which then makes all required libraries usable within the scope of your application. This includes Laravel’s first party Illuminate components as well as any required third party packages.

Laravel's `index.php` file:
```
<?php

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

// further bootstrapping methods...
```

# The directory structure of a package
In general (and by convention), a package contains a `src/` (short for “source”) folder containing all package specific logic (classes) and a `composer.json` file containing information about the package itself. Additionally, most packages also include a license and documentation.

If we take a look at the general directory structure of a generic package, you’ll notice how it looks quite different from a standard Laravel project.

```
- src
- tests
CHANGELOG.md
README.md
LICENSE
composer.json
```

In a package, all code that would live in the `app/` directory of a Laravel app, will live in the `src/` when working with a package.