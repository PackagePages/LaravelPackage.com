# Testing

To develop a robust package, it is important to have test coverage for the provided code.
Not only to confirm proper behavior of the existing code, but also to verify everything still works whenever new functionality is added.
This ensures our package can be refactored with confidence at a later stage.

Tests also allow other developers to understand how certain features of your package are to be used, and gives them confidence about the reliability of your package.

## Installing PHPUnit

There are many options to test behaviour in PHP, however we'll stay close to Laravel's defaults which uses the excellent tool PHPunit.

Install PHPUnit as a dev-dependency in our package:

```bash
composer require --dev phpunit/phpunit
```

**Note:** you might need to install a specific version if you’re developing a package for an older version of Laravel.

To configure PHPUnit, create a `phpunit.xml` file in the root directory of the package.
Then, copy the following template to use an in-memory sqlite database and enable colorful reporting.

`phpunit.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php"
         backupGlobals="false"
         backupStaticAttributes="false"
         colors="true"
         verbose="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Test Suite">
            <directory>tests</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist>
            <directory suffix=".php">src/</directory>
        </whitelist>
    </filter>
    <php>
        <env name="DB_CONNECTION" value="testing"/>
    </php>
</phpunit>
```

## Directory Structure

To accommodate for feature and unit tests, create a tests/ directory with a `Unit` and `Feature` subdirectory and a base `TestCase.php` file. The structure looks as follows:

```json
- tests
  - Feature
  - Unit
  TestCase.php
```

The `TestCase.php` extends \Orchestra\Testbench\TestCase (see example below) and contains tasks related to setting up our “world” before each test is executed. In the `TestCase` class we will implement three important set-up methods:

- `getPackageProviders()`
- `getEnvironmentSetUp()`
- `setUp()`

Let’s look at these methods one by one.

`setUp()`

You might have already used this method in your own tests. Often it is used when you need a certain model in all following tests. The instantiation of that model can therefore be extracted to a setUp() method which is called before each test. Within the tests, the desired model can be retrieved from the Test class instance variable. When using this method, don’t forget to call the parent setUp() method (and make sure to return void).

---

`getEnvironmentSetUp()`

As suggested by Orchestra Testbench: “If you need to add something early in the application bootstrapping process, you could use the getEnvironmentSetUp() method”. Therefore, I suggest it is called before the setUp() method(s).

---

`getPackageProviders()`

As the name suggest, we can load our service provider(s) within the getPackageProviders() method. We’ll do that by returning an array containing all providers. For now, we’ll just include the package specific package provider, but imagine that if the package uses an EventServiceProvider, we would also register it here.

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

Before we can run the PHPUnit test suite, we first need to map our testing namespace to the appropriate folder in the composer.json file under an “autoload-dev” (psr-4) key:

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
