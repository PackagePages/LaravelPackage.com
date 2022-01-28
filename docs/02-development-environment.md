---
title: "Development Environment"
description: "Set up a stable environment for package development. Starting with installing Composer, configuring package details and PSR autoloading in composer.json to pulling in the package locally and testing with Orchestra Testbench."
tags:
  [
    "development setup",
    "composer",
    "package skeleton",
    "PSR",
    "namespacing",
    "testing",
    "testbench",
  ]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2019-09-17
---

# Development Environment

## Installing Composer

There's a big chance that you already have Composer installed. However, if you haven't installed Composer already, the quickest way to get up and running is by copying the script provided on the download page of [Composer](https://getcomposer.org/download/). By copying and pasting the provided script in your command line, the `composer.phar` installer will be downloaded, run, and removed again. You can verify a successful installation by running `composer --version`. To update Composer to the latest version, run `composer self-update`.

## Package Skeleton

To start with developing a package, first, create an empty directory. It is not necessary to nest packages in an existing Laravel project. I would highly recommend organizing your packages separate from your (Laravel) projects for the sake of clarity.

For example, I store all packages in `~/packages/` and my Laravel apps live in `~/websites/`.

## Composer.json

Let's start by creating a `composer.json` file in the root of your package directory, having a minimal configuration (as shown below). Replace all details from the example with your own.

It is best to be consistent with naming your packages. The standard convention is to use your GitHub / Gitlab / Bitbucket / etc.` username followed by a forward-slash ("/") and then a kebab cased version of your package name.

An example `composer.json` is highlighted below.

```json
{
  "name": "johndoe/blogpackage",
  "description": "A demo package",
  "type": "library",
  "license": "MIT",
  "authors": [
    {
      "name": "John Doe",
      "email": "john@doe.com"
    }
  ],
  "require": {}
}
```

Alternatively, you can create your `composer.json` file by running `composer init` in your empty package directory.

If you're planning to **publish** the package, it is important to choose an appropriate package [type](https://getcomposer.org/doc/04-schema.md#type) (in our case, a "library") and license (e.g., "MIT"). Learn more about open source licenses at [ChooseALicense.com](https://choosealicense.com/).

## Namespacing

Since we want to use the (conventional) `src/` directory to store our code, we need to tell Composer to map the package's namespace to that specific directory when creating the autoloader (`vendor/autoload.php`).

We can register our namespace under the "psr-4" autoload key in the `composer.json` file as follows (replace the namespace with your own):

```json
{
  ...,

  "require": {},

  "autoload": {
    "psr-4": {
      "JohnDoe\\BlogPackage\\": "src"
    }
  }
}
```

## PSR-4 Autoloading

Now, you might wonder why we needed a "psr-4" key. PSR stands for PHP Standards Recommendations devised by the [PHP Framework Interoperability Group](https://www.php-fig.org/) (PHP-FIG). This group of 20 members, representing a cross-section of the PHP community, proposed a [series of PSR's](https://www.php-fig.org/psr/).

In the list, PSR-4 represents a recommendation regarding autoloading classes from file paths, replacing the until then prevailing [PSR-0 autoloading standard](https://www.php-fig.org/psr/psr-0/).

The significant difference between PSR-0 and PSR-4 is that PSR-4 allows to map a base directory to a particular namespace and therefore permits shorter namespaces. I think [this comment](https://stackoverflow.com/questions/24868586/what-are-the-differences-between-psr-0-and-psr-4/50226226#50226226) on StackOverflow has a clear description of how PSR-0 and PSR-4 work.

PSR-0

```json
"autoload": {
    "psr-0": {
        "Book\\": "src/",
        "Vehicle\\": "src/"
    }
}
```

- Looking for `Book\History\UnitedStates` in `src/Book/History/UnitedStates.php`

- Looking for `Vehicle\Air\Wings\Airplane` in `src/Vehicle/Air/Wings/Airplane.php`

PSR-4

```json
"autoload": {
    "psr-4": {
        "Book\\": "src/",
        "Vehicle\\": "src/"
    }
}
```

- Looking for `Book\History\UnitedStates` in `src/History/UnitedStates.php`

- Looking for `Vehicle\Air\Wings\Airplane` in `src/Air/Wings/Airplane.php`

## Importing the Package Locally

To help with development, you can require a local package in a local Laravel project.

If you have a local Laravel project, you can require your package locally by defining a custom so-called "repository" in the `composer.json` file **of your Laravel application**.

Add the following "repositories" key below the "scripts" section in `composer.json` file of your Laravel app (replace the "url" with the directory where your package lives):

```json
{
  "scripts": { ... },

  "repositories": [
    {
      "type": "path",
      "url": "../../packages/blogpackage"
    }
  ]
}
```

You can now require your local package in the Laravel application using your chosen namespace of the package. Following our example, this would be:

```bash
composer require johndoe/blogpackage
```

By default, the package is added under `vendor` folder as a symlink if possible. If you would like to make a physical copy instead (i.e. _mirroring_), add the field `"symlink": false` to the repository definition's `options` property:

```json
{
  "scripts": { ... },

  "repositories": [
    {
      "type": "path",
      "url": "../../packages/blogpackage",
      "options": {
        "symlink": false
      }
    }
  ]
}
```

If you have multiple packages in the same directory and want to instruct Composer to look for all of them, you can list the package location by using a wildcard `*` as follows:

```json
{
  "scripts": { ... },

  "repositories": [
    {
      "type": "path",
      "url": "../../packages/*"
    }
  ]
}
```

**Important:** you will need to perform a composer update in your Laravel application whenever you make changes to the `composer.json` file of your package or any providers it registers.

## Orchestra Testbench

We now have a `composer.json` file and an empty src/ directory. However, we don't have access to any Laravel specific functionality provided by the `Illuminate` components.

To use these components in our package, we'll require the [Orchestra Testbench](https://github.com/orchestral/testbench). Note that each version of the Laravel framework has a corresponding version of Orchestra Testbench. In this section, I'll assume we're developing a package for **Laravel 8.0**, which is the latest version at the moment of writing this section.

```bash
composer require --dev "orchestra/testbench=^6.0"
```

The full compatibility table of the Orchestra Testbench is shown below, taken from [the original documentation](https://github.com/orchestral/testbench).

| Laravel | Testbench |
| :------ | :-------- |
| 8.x     | 6.x       |
| 7.x     | 5.x       |
| 6.x     | 4.x       |
| 5.8.x   | 3.8.x     |
| 5.7.x   | 3.7.x     |
| 5.6.x   | 3.6.x     |
| 5.5.x   | 3.5.x     |
| 5.4.x   | 3.4.x     |
| 5.3.x   | 3.3.x     |
| 5.2.x   | 3.2.x     |
| 5.1.x   | 3.1.x     |
| 5.0.x   | 3.0.x     |

With Orchestra Testbench installed, you'll find a `vendor/orchestra/testbench-core` directory, containing a `laravel` and `src` directory. The `laravel` directory resembles the structure of an actual Laravel application, and the `src` directory provides the Laravel helpers that involve interaction with the project's directory structure (for example, related to file manipulation).

Before each test, TestBench creates a testing environment including a fully booted (test) application. If we use the Orchestra TestBench's basic `TestCase` for our tests, the methods as provided by the `CreatesApplication` trait in the `Orchestra\Testbench\Concerns` namespace will be responsible for creating this test application. If we look at one of these methods, `getBasePath()`, we'll see it directly points to the `laravel` folder that comes with Orchestra Testbench.

```php
// 'vendor/orchestra/testbench-core/src/Concerns/CreatesApplication.php'
/**
 * Get base path.
 *
 * @return string
 */
protected function getBasePath()
{
    return \realpath(__DIR__.'/../../laravel');
}
```
