---
title: 'Models and Migrations'
description: 'Some packages need to offer a Laravel Model. This section explains how to allow for this and include your own database migrations. Additionally, the section will cover testing the models and migrations.'
tags: ['Models', 'Migrations', 'Testing Models', 'Unit Test']
image: 'https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg'
date: 2019-09-17
---

# Models & Migrations

There are scenarios where you'll need to ship one or more Eloquent models with your package. For example, when you're developing a Blog related package that includes a `Post` model.

This chapter will cover how to provide Eloquent models within your package, including migrations, tests, and how to possibly add a relationship to the `App\User` model that ships with Laravel.

## Models

Models in our package do not differ from models we would use in a standard Laravel application. Since we required the **Orchestra Testbench**, we can create a model extending the Laravel Eloquent model and save it within the `src/Models` directory:

```php
// 'src/Models/Post.php'
<?php

namespace JohnDoe\BlogPackage\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
  use HasFactory;

  // Disable Laravel's mass assignment protection
  protected $guarded = [];
}
```

There are multiple ways to generate models together with a migration automatically. The straightforward approach is to use a regular Laravel application and then copy over the artisan-generated files to your package and then update the namespaces.

If you are looking for ways to automate the scaffolding within your package, you might install one of the following tools as a `dev` dependency within your package and use a CLI command to generate the scaffolds.

- [Laravel Package Tools](https://github.com/beyondcode/laravel-package-tools)
- [Laravel Packer](https://github.com/bitfumes/laravel-packer)
- [Laravel Package Maker](https://github.com/naoray/laravel-package-maker)

## Migrations

Migrations live in the `database/migrations` folder in a Laravel application. In our package we mimic this file structure. Therefore, database migrations will not live in the `src/` directory but in their own `database/migrations` folder. Our package's root directory now contains at least two folders: `src/` and `database/`.

After you’ve generated a migration, copy it from your “dummy” Laravel application to the package’s `database/migrations` folder.

```php
// 'database/migrations/2018_08_08_100000_create_posts_table.php'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('posts');
    }
}
```

From this point on, there are two possible approaches to present the end-user with our migration(s). We can either publish (specific) migrations (method 1) or load all migrations from our package automatically (method 2).

### Publishing Migrations (method 1)

In this approach, we register that our package “publishes” its migrations. We can do that as follows in the `boot()` method of our package’s service provider, employing the `publishes()` method, which takes two arguments:

1. an array of file paths ("source path" => "destination path")

2. the name (“tag”) we assign to this group of related publishable assets.

In this approach, it is conventional to use a "stubbed" migration. This stub is exported to a real migration when the user of our package publishes the migrations. Therefore, rename any migrations to remove the timestamp and add a `.stub` extension. In our example migration, this would lead to: `create_posts_table.php.stub`.

Next, we can implement exporting the migration(s) as follows:

```php
class BlogPackageServiceProvider extends ServiceProvider
{
  public function boot()
  {
    if ($this->app->runningInConsole()) {
      // Export the migration
      if (! class_exists('CreatePostsTable')) {
        $this->publishes([
          __DIR__ . '/../database/migrations/create_posts_table.php.stub' => database_path('migrations/' . date('Y_m_d_His', time()) . '_create_posts_table.php'),
          // you can add any number of migrations here
        ], 'migrations');
      }
    }
  }
}
```

In the code listed above, we first check if the application is running in the console. Next, we'll check if the user already published the migrations. If not, we will publish the `create_posts_table` migration in the migrations folder in the database path, prefixed with the current date and time.

The migrations of this package are now publishable under the “migrations” tag via:

```bash
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="migrations"
```

### Loading Migrations Automatically (method 2)
While the method described above gives full control over which migrations are published, Laravel offers an alternative approach making use of the `loadMigrationsFrom` helper ([see docs](https://laravel.com/docs/packages#migrations)). By specifying a migrations directory in the package's service provider, all migrations will be executed when the end-user executes `php artisan migrate` from within their Laravel application.

```php
class BlogPackageServiceProvider extends ServiceProvider
{
  public function boot()
  {
    $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
  }
}
```

Make sure to include a proper timestamp to your migrations, otherwise, Laravel can't process them. For example: `2018_08_08_100000_example_migration.php`. You can not use a stub (like in method 1) when choosing this approach.

## Testing Models and Migrations

As we create an example test, we will follow some of the basics of test-driven-development (TDD) here. Whether or not you practice TDD in your typical workflow, explaining the steps here helps expose possible problems you might encounter along the way, thus making troubleshooting simpler. Let's get started:

### Writing a Unit Test

Now that we’ve set up **PHPunit**, let’s create a unit test for our Post model in the `tests/Unit` directory called `PostTest.php`. Let's write a test that verifies a `Post` has a title:

```php
// 'tests/Unit/PostTest.php'
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use JohnDoe\BlogPackage\Tests\TestCase;
use JohnDoe\BlogPackage\Models\Post;

class PostTest extends TestCase
{
  use RefreshDatabase;

  /** @test */
  function a_post_has_a_title()
  {
    $post = Post::factory()->create(['title' => 'Fake Title']);
    $this->assertEquals('Fake Title', $post->title);
  }
}
```

Note: we're using the `RefreshDatabase` trait to be sure that we start with a clean database state before every test.

### Running the Tests

We can run our test suite by calling the PHPUnit binary in our vendor directory using `./vendor/bin/phpunit`. However, let’s alias this to `test` in our `composer.json` file by adding a “script”:

```json
{
  ...,

  "autoload-dev": {},

  "scripts": {
    "test": "vendor/bin/phpunit",
    "test-f": "vendor/bin/phpunit --filter"
  }
}
```

We can now run `composer test` to run all of our tests and `composer test-f` followed by a test method/class's name to run that test solely.

When we run `composer test-f a_post_has_a_title`, it leads us to the following error:

```
Error: Class 'Database\Factories\JohnDoe\BlogPackage\Models\PostFactory' not found
```

The abovementioned error tells us that we need to create a model factory for the `Post` model.

### Creating a Model Factory

Let’s create a `PostFactory` in the `database/factories` folder:

```php
// 'database/factories/PostFactory.php'
<?php

namespace JohnDoe\BlogPackage\Database\Factories;

use JohnDoe\BlogPackage\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition()
    {
        return [
            //
        ];
    }
}

```

As with the `src` folder, for our package users to be able to use our model factories, we'll need to register the `database/factories` folder within a namespace in our `composer.json` file:

```json
{
  ...,
  "autoload": {
    "psr-4": {
      "JohnDoe\\BlogPackage\\": "src",
      "JohnDoe\\BlogPackage\\Database\\Factories\\": "database/factories"
    }
  },
  ...
}
```

After setting it up, don't forget to run `composer dump-autoload`.

### Configuring our Model factory

Rerunning our tests lead to the following error:

```
Error: Class 'Database\Factories\JohnDoe\BlogPackage\Models\PostFactory' not found
```

The abovementioned error is caused by Laravel, which tries to resolve the Model class for our `PostFactory` assuming the default namespaces of a usual project (as of version 8.x, `App` or `App\Models`).
To be able to instantiate the right Model from our package with the `Post::factory()` method, we need to add the following method to our `Post` Model:

```php
// 'src/Models/Post.php'

protected static function newFactory()
{
    return \JohnDoe\BlogPackage\Database\Factories\PostFactory::new();
}
```

However, the tests will still fail since we haven’t created the `posts` table in our in-memory SQLite database. We need to tell our tests to first perform all migrations before running the tests.

Let’s load the migrations in the `getEnvironmentSetUp()` method of our `TestCase`:

```php
// 'tests/TestCase.php'

public function getEnvironmentSetUp($app)
{
  // import the CreatePostsTable class from the migration
  include_once __DIR__ . '/../database/migrations/create_posts_table.php.stub';

  // run the up() method of that migration class
  (new \CreatePostsTable)->up();
}
```

Now, running the tests again will lead to the expected error of no ‘title’ column being present on the ‘posts’ table. Let’s fix that in the `create_posts_table.php.stub` migration:

```php
// 'database/migrations/create_posts_table.php.stub'
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->timestamps();
});

```

After running the test, you should see it passing.

### Adding Tests for Other Columns

Let’s add tests for the “body” and “author_id”:

```php
// 'tests/Unit/PostTest.php'
class PostTest extends TestCase
{
  use RefreshDatabase;

  /** @test */
  function a_post_has_a_title()
  {
    $post = Post::factory()->create(['title' => 'Fake Title']);
    $this->assertEquals('Fake Title', $post->title);
  }

  /** @test */
  function a_post_has_a_body()
  {
    $post = Post::factory()->create(['body' => 'Fake Body']);
    $this->assertEquals('Fake Body', $post->body);
  }

  /** @test */
  function a_post_has_an_author_id()
  {
    // Note that we are not assuming relations here, just that we have a column to store the 'id' of the author
    $post = Post::factory()->create(['author_id' => 999]); // we choose an off-limits value for the author_id so it is unlikely to collide with another author_id in our tests
    $this->assertEquals(999, $post->author_id);
  }
}
```

You can continue driving this out with TDD on your own, running the tests, exposing the next thing to implement, and testing again.

Eventually you’ll end up with a model factory and migration as follows:

```php
// 'database/factories/PostFactory.php'
<?php

namespace JohnDoe\BlogPackage\Database\Factories;

use JohnDoe\BlogPackage\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition()
    {
        return [
            'title'     => $this->faker->words(3, true),
            'body'      => $this->faker->paragraph,
            'author_id' => 999,
        ];
    }
}

```

For now, we hard-coded the ‘author_id’. In the next section, we'll see how we could whip up a relationship with a `User` model.

```php
// 'database/migrations/create_posts_table.php.stub'

Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->unsignedBigInteger('author_id');
    $table->timestamps();
});
```

## Models related to App\User

Now that we have an “author_id” column on our `Post` model, let’s create a relationship between a `Post` and a `User`. However, we have a problem since we need a `User` model, but this model also comes out-of-the-box with a fresh installation of the Laravel framework…

We can’t just provide our own `User` model, since you likely want your end-user to be able to hook up the `User` model from their Laravel app. 

Below, there are two options to create a relation  

### Approach 1: Fetching the User model from the Auth configuration

If you simply want to create a relationship between **authenticated users** and *e.g.* a `Post` model, the easiest option is to reference the Model that is used in the `config/auth.php` file. By default, this is the `App\Models\User` Eloquent model.

If you just want to target the Eloquent model that is responsible for the authentication, create a `belongsToMany` relationship on the `Post` model as follows:

```php
// Post model
class Post extends Model
{
  public function author()
  {
    return $this->belongsTo(config('auth.providers.users.model'));
  }
}
```

However, what if the user of our package has an `Admin` and a `User` model and the author of a `Post` can be an `Admin` model or a `User` model ? In such cases, you can opt for a polymorphic relationship.

### Approach 2: Using a Polymorphic Relationship

Instead of opting for a conventional one-to-many relationship (a user can have many posts, and a post belongs to a user), we’ll use a **polymorphic** one-to-many relationship where a `Post` morphs to a specific related model (not necessarily a `User` model).

Let’s compare the standard and polymorphic relationships.

Definition of a standard one-to-many relationship:

```php
// Post model
class Post extends Model
{
  public function author()
  {
    return $this->belongsTo(User::class);
  }
}

// User model
class User extends Model
{
  public function posts()
  {
    return $this->hasMany(Post::class);
  }
}
```

Definition of a polymorphic one-to-many relationship:

```php
// Post model
class Post extends Model
{
  public function author()
  {
    return $this->morphTo();
  }
}

// User (or other) model
use JohnDoe\BlogPackage\Models\Post;

class Admin extends Model
{
  public function posts()
  {
    return $this->morphMany(Post::class, 'author');
  }
}
```

After adding this `author()` method to our Post model, we need to update our `create_posts_table_migration.php.stub` file to reflect our polymorphic relationship. Since we named the method “author”, Laravel expects an “author_id” and an “author_type” field. The latter contains a string of the namespaced model we refer to (for example, “App\User”).

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->unsignedBigInteger('author_id');
    $table->string('author_type');
    $table->timestamps();
});
```

Now, we need a way to provide our end-user with the option to allow specific models to have a relationship with our `Post` model. **Traits** offer an excellent solution for this exact purpose.

### Providing a Trait

Create a `Traits` folder in the `src/` directory and add the following `HasPosts` trait:

```php
// 'src/Traits/HasPosts.php'
<?php

namespace JohnDoe\BlogPackage\Traits;

use JohnDoe\BlogPackage\Models\Post;

trait HasPosts
{
  public function posts()
  {
    return $this->morphMany(Post::class, 'author');
  }
}
```

Now the end-user can add a `use HasPosts` statement to any of their models (likely the `User` model), which would automatically register the one-to-many relationship with our `Post` model. This allows creating new posts as follows:

```php
// Given we have a User model, using the HasPosts trait
$user = User::first();

// We can create a new post from the relationship
$user->posts()->create([
  'title' => 'Some title',
  'body' => 'Some body',
]);
```

### Testing the Polymorphic Relationship

Of course, we want to prove that any model using our `HasPost` trait can create new posts and that those posts are stored correctly.

Therefore, we’ll create a new `User` model, not within the `src/Models/` directory, but rather in our `tests/` directory.

To create users within our tests we'll need to overwrite the `UserFactory` provided by the Orchestra Testbench package, as shown below.

```php
// 'tests/UserFactory.php'
<?php

namespace JohnDoe\BlogPackage\Tests;

use Orchestra\Testbench\Factories\UserFactory as TestbenchUserFactory;

class UserFactory extends TestbenchUserFactory
{
  protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
            'remember_token' => \Illuminate\Support\Str::random(10),
        ];
    }
}
```

In the `User` model we’ll use the same traits available on the `User` model that ships with a standard Laravel project to stay close to a real-world scenario. Also, we use our own `HasPosts` trait and `UserFactory`:

```php
// 'tests/User.php'
<?php

namespace JohnDoe\BlogPackage\Tests;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use JohnDoe\BlogPackage\Traits\HasPosts;

class User extends Model implements AuthorizableContract, AuthenticatableContract
{
    use HasPosts, Authorizable, Authenticatable, HasFactory;

    protected $guarded = [];

    protected $table = 'users';

    protected static function newFactory()
    {
        return UserFactory::new();
    }
}
```

Now that we have a `User` model, we also need to add a new migration (the standard users table migration that ships with Laravel) to our database`/migrations` as `create_users_table.php.stub`:

```php
// 'database/migrations/create_users_table.php.stub'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
```

Also load the migration at the beginning of our tests, by including the migration and performing its `up()` method in our `TestCase`:

```php
// 'tests/TestCase.php'
public function getEnvironmentSetUp($app)
{
    include_once __DIR__ . '/../database/migrations/create_posts_table.php.stub';
    include_once __DIR__ . '/../database/migrations/create_users_table.php.stub';

    // run the up() method (perform the migration)
    (new \CreatePostsTable)->up();
    (new \CreateUsersTable)->up();
}
```

### Updating Our Post Model Factory

Now that we can whip up `User` models with our new factory, let’s create a new `User` in our `PostFactory` and then assign it to “author_id” and “author_type”:

```php
// 'database/factories/PostFactory.php'
<?php

namespace JohnDoe\BlogPackage\Database\Factories;

use JohnDoe\BlogPackage\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use JohnDoe\BlogPackage\Tests\User;

class PostFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Post::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $author = User::factory()->create();

        return [
            'title'     => $this->faker->words(3, true),
            'body'      => $this->faker->paragraph,
            'author_id' => $author->id,
            'author_type' => get_class($author)
        ];
    }
}
```

Next, we update the `Post` unit test to verify an ‘author_type’ can be specified.

```php
// 'tests/Unit/PostTest.php'
class PostTest extends TestCase
{
  // other tests...

  /** @test */
  function a_post_has_an_author_type()
  {
    $post = Post::factory()->create(['author_type' => 'Fake\User']);
    $this->assertEquals('Fake\User', $post->author_type);
  }
}
```

Finally, we need to verify that our test `User` can create a `Post` and it is stored correctly.

Since we are not creating a new post using a call to a specific route in the application, let's store this test in the `Post` unit test. In the next section on “Routes & Controllers”, we’ll make a POST request to an endpoint to create a new `Post` model and therefore divert to a Feature test.

A Unit test that verifies the desired behavior between a `User` and a `Post` could look as follows:

```php
// 'tests/Unit/PostTest.php'
class PostTest extends TestCase
{
  // other tests...

  /** @test */
  function a_post_belongs_to_an_author()
  {
    // Given we have an author
    $author = User::factory()->create();
    // And this author has a Post
    $author->posts()->create([
        'title' => 'My first fake post',
        'body'  => 'The body of this fake post',
    ]);

    $this->assertCount(1, Post::all());
    $this->assertCount(1, $author->posts);

    // Using tap() to alias $author->posts()->first() to $post
    // To provide cleaner and grouped assertions
    tap($author->posts()->first(), function ($post) use ($author) {
        $this->assertEquals('My first fake post', $post->title);
        $this->assertEquals('The body of this fake post', $post->body);
        $this->assertTrue($post->author->is($author));
    });
  }
}
```

At this stage, all of the tests should be passing.
