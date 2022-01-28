---
title: "Testing"
description: "Testing is an essential part of every package to ensure proper behavior and allow refactoring with confidence. This section explains how to set up a testing environment using PHPUnit to create robust packages."
tags: ["Testing", "PHPUnit", "Directory Structure"]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2019-09-17
---

<toggleDarkMode/>

# Testing

It is essential to have proper test coverage for the package's provided code. Adding tests to our package can confirm the existing code's behavior, verify everything still works whenever adding new functionality, and ensure we can safely refactor our package with confidence at a later stage.

Additionally, having good code coverage can motivate potential contributors by giving them more confidence that their addition does not break something else in the package. Tests also allow other developers to understand how specific features of your package are to be used and give them confidence about your package's reliability.

## Installing PHPUnit

There are many options to test behavior in PHP. However, we'll stay close to Laravel's defaults, which uses the excellent tool PHPUnit.

Install PHPUnit as a dev-dependency in our package:

```bash
composer require --dev phpunit/phpunit
```

**Note:** you might need to install a specific version if you're developing a package for an older version of Laravel.

To configure PHPUnit, create a `phpunit.xml` file in the root directory of the package.
Then, copy the following template to use an in-memory sqlite database and enable colorful reporting.

`phpunit.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  bootstrap="vendor/autoload.php"
  backupGlobals="false"
  backupStaticAttributes="false"
  colors="true"
  verbose="true"
  convertErrorsToExceptions="true"
  convertNoticesToExceptions="true"
  convertWarningsToExceptions="true"
  processIsolation="false"
  stopOnFailure="false"
  xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/9.3/phpunit.xsd"
>
  <coverage>
    <include>
      <directory suffix=".php">src/</directory>
    </include>
  </coverage>
  <testsuites>
    <testsuite name="Unit">
      <directory suffix="Test.php">./tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
      <directory suffix="Test.php">./tests/Feature</directory>
    </testsuite>
  </testsuites>
  <php>
    <env name="DB_CONNECTION" value="testing"/>
    <env name="APP_KEY" value="base64:2fl+Ktvkfl+Fuz4Qp/A75G2RTiWVA/ZoKZvp6fiiM10="/>
  </php>
</phpunit>
```

Note the dummy `APP_KEY` in the example above. This environment variable is consumed by [Laravel's encrypter](https://laravel.com/docs/8.x/encryption#using-the-encrypter), which your tests might be making use of. For most cases, the dummy value will be sufficient. However, you are free to either change this value to reflect an actual app key (of your Laravel application) or leave it off entirely if your test suite does not interact with the encrypter.

## Directory Structure

To accommodate Feature and Unit tests, create a `tests/` directory with a `Unit` and `Feature` subdirectory and a base `TestCase.php` file. The structure looks as follows:

```json
- tests
    - Feature
    - Unit
      TestCase.php
```

The `TestCase.php` extends `\Orchestra\Testbench\TestCase` (see example below) and contains tasks related to setting up our “world” before each test is executed. In the `TestCase` class we will implement three important set-up methods:

- `getPackageProviders()`
- `getEnvironmentSetUp()`
- `setUp()`

Let's look at these methods one by one.

`setUp()`

You might have already used this method in your tests. Often it is used when you need a certain model in all following tests. The instantiation of that model can therefore be extracted to a setUp() method which is called before each test. Within the tests, the desired model can be retrieved from the Test class instance variable. When using this method, don't forget to call the parent setUp() method (and make sure to return void).

---

`getEnvironmentSetUp()`

As suggested by Orchestra Testbench: "If you need to add something early in the application bootstrapping process, you could use the getEnvironmentSetUp() method". Therefore, I suggest it is called before the setUp() method(s).

---

`getPackageProviders()`

As the name suggests, we can load our service provider(s) within the getPackageProviders() method. We'll do that by returning an array containing all providers. For now, we'll just include the package specific package provider, but imagine that if the package uses an EventServiceProvider, we would also register it here.

---

In a package, `TestCase` will inherit from the Orchestra Testbench TestCase:

```php
// 'tests/TestCase.php'
<?php

namespace JohnDoe\BlogPackage\Tests;

use JohnDoe\BlogPackage\BlogPackageServiceProvider;

class TestCase extends \Orchestra\Testbench\TestCase
{
  public function setUp(): void
  {
    parent::setUp();
    // additional setup
  }

  protected function getPackageProviders($app)
  {
    return [
      BlogPackageServiceProvider::class,
    ];
  }

  protected function getEnvironmentSetUp($app)
  {
    // perform environment setup
  }
}
```

Before we can run the PHPUnit test suite, we first need to map our testing namespace to the appropriate folder in the composer.json file under an "autoload-dev" (psr-4) key:

```json
{
  ...,

  "autoload": {},

  "autoload-dev": {
    "psr-4": {
      "JohnDoe\\BlogPackage\\Tests\\": "tests"
    }
  }
}
```

Finally, re-render the autoload file by running `composer dump-autoload`.
