---
title: 'Basics of Package Development'
description: 'Explore the basics of a PHP package, including the general directory structure, composer.json and autoloading.'
tags: ['package basics', 'directory structure', 'autoloading', 'composer']
image: 'https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg'
date: 2019-09-17
---

# The Basics

## Autoloading

After each installation or update, composer will generate an `autoload.php` file in the `/vendor` directory. By including this single file, you’ll be able to access all classes provided by your installed libraries.

Looking at a Laravel project, you’ll see that the `index.php` file in the application root (which handles all incoming requests) requires the autoloader, which then makes all required libraries usable within the scope of your application. This includes Laravel’s first party Illuminate components as well as any required third party packages.

Laravel's `index.php` file:

```php
<?php

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

// additional bootstrapping methods...
```

## Directory Structure

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

In a package, all code that would live in the `app/` directory of a Laravel app, will live in the `src/` directory when working with a package.
