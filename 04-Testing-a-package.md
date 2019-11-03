# The importance of testing
To develop a robust package, it is important to have test coverage for the provided code. 
Not only to confirm proper behavior of the existing code, but also to verify everything still works whenever new functionality is added.
This ensures our package can be refactored with confidence at a later stage.

Therefore, the following sections are dedicated to testability.

# Installing PHPUnit
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

# Tests directory structure
To accommodate for feature and unit tests, create a tests/ directory with a `Unit` and `Feature` subdirectory.

[...]
