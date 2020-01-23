# Artisan Commands

Laravel ships with a PHP executable 'artisan' file, providing a command-line interface (CLI) for the framework. Via this CLI, you can access commands as `php artisan migrate` and `php artisan make:model Post`.

Let's say that we want to provide an easy artisan command for our end user to publish the config file, via: `php artisan blogpackage:install`. However, there are a lot of things you could do. Make sure to read up on the artisan console in the [Laravel documentation](https://laravel.com/docs/6.x/artisan).

## Creating a new command
Create a new `Console` folder in the `src/` directory and create a new file named `InstallBlogPackage.php`. This class will extend Laravel's `Command` class and provide a `$signature` (the command) and a `$description` property. In the `handle()` method we specify what our command will do. In this case, we provide some feedback that we're "installing" the package and we'll call another artisan command to publish the config file. Finally, we let the user know that we're done. 

```php
// 'src/Console/InstallBlogPackage.php'
<?php

namespace JohnDoe\BlogPackage\Console;

use Illuminate\Console\Command;

class InstallBlogPackage extends Command
{
    protected $signature = 'blogpackage:install';

    protected $description = 'Install the BlogPackage';

    public function handle()
    {
        $this->info('Installing BlogPackage...');

        $this->info('Publishing configuration...');

        $this->call('vendor:publish', [
            '--provider' => "JohnDoe\BlogPackage\BlogPackageServiceProvider",
            '--tag' => "config"
        ]);

        $this->info('Installed BlogPackage');
    }
}
```

## Registering the command in the service provider
We need to present this package functionality to the end user, thus registering it in the package's service container. Again, we only want to provide this functionality from the command-line so we'll add the publish() method within the if-statement (don't forget to import the class):

```php
// 'BlogPackageServiceProvider.php'
use JohnDoe\BlogPackage\Console\InstallBlogPackage;
﻿
public function boot()
{﻿
  if ($this->app->runningInConsole()) {
    // publish config file

    $this->commands([
        InstallBlogPackage::class,
    ]);
  }
}
```

## Testing the artisan command
To test that our command works, let's create a new unit test called `InstallBlogPackageTest.php` in the unit test folder.

Since we’re using **Orchestra Testbench**, we have a config folder at `config_path()` containing every file a normal Laravel installation would have. (You can check where this directory lives yourself if you `dd(config_path()))`. Therefore, we can easily assert that this directory should have our `blogpackage.php` config file after running our artisan command. To make sure we're starting at a clean state, let's delete any remainder configuration file from the previous test first.

```php
// 'tests/Unit/InstallBlogPackageTest.php'
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use JohnDoe\BlogPackage\Tests\TestCase;

class InstallBlogPackageTest extends TestCase
{
    /** @test */
    function the_install_command_copies_a_the_configuration()
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

## Hiding a command
There might be cases where you'd like to exclude the command from the list of Artisan commands. You can define a `$hidden` property on the command class, which will not show the specific command in the list of Artisan commands. Note, however, that the command can still be used and is only hidden. 

```php
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

## Creating Generator Command

Laravel provides an easy way to create GeneratorCommands (i.e. commands with signatures such as 
`php artisan make:controller`. These serve as ways for creating classes from stub templates.

In order to create GeneratorCommands you have to extend the `Illuminate\Console\GeneratorCommand` class, by overriding 
the following fields and methods:
- `protected $name`: the intended name for the command
- `protected $description`: the command description
- `protected $type`: the type of class the command generates
- `protected function getStub()`: method returning the path of the stub template file
- `protected function getDefaultNamespace($rootNamespace)`: the default namespace of the generated class
- `public function handle()`: the body of the command

the `GeneratorCommand` base class also contains some helpers methods:
- `getNameInput()`: returns the name passed from command line command execution
- `qualifyClass(string $name)`: returns the qualified class name for a given name
- `getPath(string $name)`: returns the file path for a given name

Consider the following example for the `php artisan make:foo MyFoo` command:

```php
use Illuminate\Console\GeneratorCommand;


class MakeMeasurableEventCommand extends GeneratorCommand
{
    protected $name = 'make:foo';

    protected $description = 'Create a new foo class';

    protected $type = 'Foo';

    protected function getStub()
    {
        return __DIR__.'/../../stubs/foo.php.stub';
    }

    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace.'\Foo';
    }

    public function handle()
    {
        parent::handle();

        $this->doOtherOperations();
    }

    protected function doOtherOperations()
    {
        $name = $this->qualifyClass($this->getNameInput());
        $path = $this->getPath($name);
        $content = file_get_contents($path);

        // Update the file content with additional data
        
        file_put_contents($path, $content);
    }
}
```

Now consider the `stubs/foo.php.stub` file used as stub:

```php
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

Note that `DummyNamespace` and `DummyClass` are just placeholder and are automatically replaced with the correct values 
automatically generated by the GeneratorCommand class.