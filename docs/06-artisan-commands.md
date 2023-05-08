---
title: "Commands"
description: "Creating and testing custom Artisan Commands in your package. Additionally, this section covers testing a command, without publishing it within your package for testing purposes."
tags: ["Artisan", "Commands", "Testing Commands", "Test-Only Commands"]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2019-09-17
---

# Artisan Commands

Laravel ships with an executable `artisan` file, which offers a number of helpful commands through a command-line interface (CLI).

Via this CLI, you can access commands as `php artisan migrate` and `php artisan make:model Post`. There are a lot of things you could do with commands. Make sure to read up on the artisan console in the [Laravel documentation](https://laravel.com/docs/artisan).

Let's say that we want to provide an easy artisan command for our end user to publish the config file, via: `php artisan blogpackage:install`.

## Creating a new Command

Create a new `Console` folder in the `src/` directory and create a new file named `InstallBlogPackage.php`. This class will extend Laravel's `Command` class and provide a `$signature` (the command) and a `$description` property. In the `handle()` method, we specify what our command will do. In this case we provide some feedback that we're "installing" the package, and we'll call another artisan command to publish the config file. Using the `File` facade we can check if the configuration file already exists. If so, we'll ask if we should overwrite it or cancel publishing of the config file. Finally, we let the user know that we're done.

```php title="src/Console/InstallBlogPackage.php"
<?php

namespace JohnDoe\BlogPackage\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class InstallBlogPackage extends Command
{
    protected $signature = 'blogpackage:install';

    protected $description = 'Install the BlogPackage';

    public function handle()
    {
        $this->info('Installing BlogPackage...');

        $this->info('Publishing configuration...');

        if (! $this->configExists('blogpackage.php')) {
            $this->publishConfiguration();
            $this->info('Published configuration');
        } else {
            if ($this->shouldOverwriteConfig()) {
                $this->info('Overwriting configuration file...');
                $this->publishConfiguration($force = true);
            } else {
                $this->info('Existing configuration was not overwritten');
            }
        }

        $this->info('Installed BlogPackage');
    }

    private function configExists($fileName)
    {
        return File::exists(config_path($fileName));
    }

    private function shouldOverwriteConfig()
    {
        return $this->confirm(
            'Config file already exists. Do you want to overwrite it?',
            false
        );
    }

    private function publishConfiguration($forcePublish = false)
    {
        $params = [
            '--provider' => "JohnDoe\BlogPackage\BlogPackageServiceProvider",
            '--tag' => "config"
        ];

        if ($forcePublish === true) {
            $params['--force'] = true;
        }

       $this->call('vendor:publish', $params);
    }
}
```

## Registering a Command in the Service Provider

We need to present this package functionality to the end-user, thus registering it in the package's service provider.

Since we only want to provide this functionality when used from the command-line we'll add it within a conditional which checks if the application instance is running in the console:

```php title="BlogPackageServiceProvider.php"
<?php

use JohnDoe\BlogPackage\Console\InstallBlogPackage;

public function boot()
{
    // Register the command if we are using the application via the CLI
    if ($this->app->runningInConsole()) {
        $this->commands([
            InstallBlogPackage::class,
        ]);
    }
}
```

## Scheduling a Command in the Service Provider

If you want to schedule a command from your package instead of `app/Console/Kernel.php`, inside your service provider, you need to wait until after the Application has booted and the Schedule instance has been defined:

```php title="BlogPackageServiceProvider.php"
<?php

use Illuminate\Console\Scheduling\Schedule;

public function boot()
{
    // Schedule the command if we are using the application via the CLI
    if ($this->app->runningInConsole()) {
        $this->app->booted(function () {
            $schedule = $this->app->make(Schedule::class);
            $schedule->command('some:command')->everyMinute();
        });
    }
}
```

## Testing a Command

To test that our Command class works, let's create a new unit test called `InstallBlogPackageTest.php` in the Unit test folder.

Since we're using **Orchestra Testbench**, we have a config folder at `config_path()` containing every file a typical Laravel installation would have. (You can check where this directory lives yourself if you `dd(config_path()))`. Therefore, we can easily assert that this directory should have our `blogpackage.php` config file after running our artisan command. To ensure we're starting clean, let's delete any remainder configuration file from the previous test first.

```php title="tests/Unit/InstallBlogPackageTest.php"
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use JohnDoe\BlogPackage\Tests\TestCase;

class InstallBlogPackageTest extends TestCase
{
    /** @test */
    function the_install_command_copies_the_configuration()
    {
        // make sure we're starting from a clean state
        if (File::exists(config_path('blogpackage.php'))) {
            unlink(config_path('blogpackage.php'));
        }

        $this->assertFalse(File::exists(config_path('blogpackage.php')));

        Artisan::call('blogpackage:install');

        $this->assertTrue(File::exists(config_path('blogpackage.php')));
    }
}
```

In addition to the basic test which asserts that a configuration file is present after installation, we can add several tests which assert the appropriate installation process of our package. Let's add tests for the other scenarios where the user already has a configuration with the name `blogpackage.php` published. We will utilize the assertions `expectsQuestion`, `expectsOutput`, `doesntExpectOutput`, and `assertExitCode`.

```php title="tests/Unit/InstallBlogPackageTest.php"
<?php

/** @test */
public function when_a_config_file_is_present_users_can_choose_to_not_overwrite_it()
{
    // Given we have already have an existing config file
    File::put(config_path('blogpackage.php'), 'test contents');
    $this->assertTrue(File::exists(config_path('blogpackage.php')));

    // When we run the install command
    $command = $this->artisan('blogpackage:install');

    // We expect a warning that our configuration file exists
    $command->expectsConfirmation(
        'Config file already exists. Do you want to overwrite it?',
        // When answered with "no"
        'no'
    );

    // We should see a message that our file was not overwritten
    $command->expectsOutput('Existing configuration was not overwritten');

    // Assert that the original contents of the config file remain
    $this->assertEquals('test contents', file_get_contents(config_path('blogpackage.php')));

    // Clean up
    unlink(config_path('blogpackage.php'));
}

/** @test */
public function when_a_config_file_is_present_users_can_choose_to_do_overwrite_it()
{
    // Given we have already have an existing config file
    File::put(config_path('blogpackage.php'), 'test contents');
    $this->assertTrue(File::exists(config_path('blogpackage.php')));

    // When we run the install command
    $command = $this->artisan('blogpackage:install');

    // We expect a warning that our configuration file exists
    $command->expectsConfirmation(
        'Config file already exists. Do you want to overwrite it?',
        // When answered with "yes"
        'yes'
    );
    
    // execute the command to force override 
    $command->execute();

    $command->expectsOutput('Overwriting configuration file...');

    // Assert that the original contents are overwritten
    $this->assertEquals(
        file_get_contents(__DIR__.'/../config/config.php'),
        file_get_contents(config_path('blogpackage.php'))
    );

    // Clean up
    unlink(config_path('blogpackage.php'));
}
```

## Hiding a Command

There might be cases where you'd like to exclude the command from the list of Artisan commands. You can define a `$hidden` property on the command class, which will not show the specific command in the list of Artisan commands. NB: you can still use the command while hidden.

```php
<?php

class InstallBlogPackage extends Command
{
    protected $hidden = true;

    protected $signature = 'blogpackage:install';

    protected $description = 'Install the BlogPackage';

    public function handle()
    {
        // ...
    }
}
```

## Creating a Generator Command

Laravel provides an easy way to create _Generator_ Commands, _i.e.,_ commands with signatures such as `php artisan make:controller`. Those commands modify a general, predefined template (stub) to a specific application. For example, by automatically injecting the correct namespace.

To create a Generator Command, you have to extend the `Illuminate\Console\GeneratorCommand` class, and override the following properties and methods:

- `protected $name`: name of the command
- `protected $description`: description of the command
- `protected $type`: the type of class the command generates
- `protected function getStub()`: method returning the path of the stub template file
- `protected function getDefaultNamespace($rootNamespace)`: the default namespace of the generated class
- `public function handle()`: the body of the command

The `GeneratorCommand` base class provides some helper methods:

- `getNameInput()`: returns the name passed from command line execution
- `qualifyClass(string $name)`: returns the qualified class name for a given class name
- `getPath(string $name)`: returns the file path for a given name

Consider the following example for the `php artisan make:foo MyFoo` command:

```php
<?php

namespace JohnDoe\BlogPackage\Console;

use Illuminate\Console\GeneratorCommand;

class MakeFooCommand extends GeneratorCommand
{
    protected $name = 'make:foo';

    protected $description = 'Create a new foo class';

    protected $type = 'Foo';

    protected function getStub()
    {
        return __DIR__ . '/stubs/foo.php.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Foo';
    }

    public function handle()
    {
        parent::handle();

        $this->doOtherOperations();
    }

    protected function doOtherOperations()
    {
        // Get the fully qualified class name (FQN)
        $class = $this->qualifyClass($this->getNameInput());

        // get the destination path, based on the default namespace
        $path = $this->getPath($class);

        $content = file_get_contents($path);

        // Update the file content with additional data (regular expressions)

        file_put_contents($path, $content);
    }
}
```

Note that the Generator Command will export the class to a directory **based on the namespace** specified in the `getDefaultNamespace()` method.

As with the `InstallBlogPackage` command, we have to register this new command in the `BlogPackageServiceProvider`:

```php title="BlogPackageServiceProvider.php"
<?php

use JohnDoe\BlogPackage\Console\{InstallBlogPackage, MakeFooCommand};

public function boot()
{
  if ($this->app->runningInConsole()) {
    // publish config file

    $this->commands([
        InstallBlogPackage::class,
        MakeFooCommand::class, // registering the new command
    ]);
  }
}
```

### Creating a stub

You are free to store stubs in a different directory, but we'll store the stubs in the `Console/stubs` directory in this example. For our `Foo` class generator, the stub could look as follows:

```php title="stubs/foo.php.stub"
<?php

namespace DummyNamespace;

use JohnDoe\BlogPackage\Foo;

class DummyClass implements Foo
{
    public function myFoo()
    {
        // foo
    }
}
```

Note that `DummyNamespace` and `DummyClass` are placeholders, strictly defined in the `GeneratorCommand` base class. Laravel expects these specific names to replace them automatically with the correct values.

## Testing Generator Commands

We can add a feature test for this command in the `tests/Feature` directory, called `MakeFooCommandTest.php`, which verifies that a new file is created and contains the correct contents:

```php
<?php

namespace JohnDoe\BlogPackage\Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use JohnDoe\BlogPackage\Tests\TestCase;

class MakeFooCommandTest extends TestCase
{
    /** @test */
    function it_creates_a_new_foo_class()
    {
        // destination path of the Foo class
        $fooClass = app_path('Foo/MyFooClass.php');

        // make sure we're starting from a clean state
        if (File::exists($fooClass)) {
            unlink($fooClass);
        }

        $this->assertFalse(File::exists($fooClass));

        // Run the make command
        Artisan::call('make:foo MyFooClass');

        // Assert a new file is created
        $this->assertTrue(File::exists($fooClass));

        // Assert the file contains the right contents
        $expectedContents = <<<CLASS
<?php

namespace App\Foo;

use JohnDoe\BlogPackage\Foo;

class MyFooClass implements Foo
{
    public function myFoo()
    {
        // foo
    }
}
CLASS;

        $this->assertEquals($expectedContents, file_get_contents($fooClass));
    }
}
```

## Creating a Test-Only Command

There are some situations where you would like to only use a particular command for testing and not in your application itself. For example, when your package provides a `Trait` that Command classes can use. To test the trait, you want to use an actual command.

Using an actual command solely for test purposes doesn't add functionality to the package and should not be published. A viable solution is to register the Command **only** in the tests, by hooking into Laravel's `Application::starting()` method as [proposed by Marcel Pociot](https://twitter.com/marcelpociot/status/1219274939565514754):

```php
<?php

namespace JohnDoe\BlogPackage\Tests\Feature;

use JohnDoe\BlogPackage\Tests\Commands\TestCommand;
use Illuminate\Console\Application;
use Illuminate\Support\Facades\Artisan;
use Orchestra\Testbench\TestCase;

class TestCommandTest extends TestCase
{
   /** @test **/
   public function it_does_a_certain_thing()
   {
        Application::starting(function ($artisan) {
            $artisan->add(app(TestCommand::class));
        });

        // Running the command
        Artisan::call('test-command:run');

       // Assertions...
   }
}
```
