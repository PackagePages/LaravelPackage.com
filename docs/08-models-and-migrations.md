# Models & Migrations

Sometimes you want your package to offer a bit more. If we imagine that we're developing a Blog related package, we might want to provide a Post model for example. This will require us to handle Models, migrations, testing, and even connect relationships with the `App\User` model that ships with Laravel.

## Models
Models in our package do not differ from models we would use in a standard Laravel application. Since we required the **Orchestra Testbench**, we can create a model extending the Laravel Eloquent model and save it within the `src/Models` directory:

```php
// 'src/Models/Post.php'
<?php

namespace JohnDoe\BlogPackage\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
  // Disable Laravel's mass assignment protection
  protected $guarded = [];
}
```

To quickly scaffold your models together with a migration, I would advise to create a new Laravel application (a “dummy application” just for the creation of models / migrations / etc.) and use the `php artisan make:model -m` command and copy the model to the package’s `src/Models` directory and using the proper namespace.

## Migrations
Migrations live in the `database/migrations` folder in a Laravel application. In our package we mimic this file structure. Therefore, database migrations will not live in the `src/` directory but in their own `database/migrations` folder. The root directory of our package now contains at least two folders: `src/` and `database/`.

After you’ve generated the migration, copy it from your “dummy” Laravel application to the package’s `database/migrations` folder. Rename it to `create_posts_table.php.stub` removing its timestamp and using a `.stub` extension.

```php
// 'database/migrations/create_posts_table.php.stub'
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

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
            $table->bigIncrements('id');
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

To present the end user with our migration(s), we need to register that our package “publishes” its migrations. We can do that as follows in the `boot()` method of our package’s service provider, employing the `publishes()` method, which takes two arguments: 

1. an array of file paths ("source path" => "destination path")
 
2. the name (“tag”) we assign to this group of related publishable assets.

Practically, we can implement this functionality as follows:

```php
class BlogPackageServiceProvider extends ServiceProvider
{
  public function boot()
  {
    if ($this->app->runningInConsole()) {
      // publish config file
      // register artisan command
﻿
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

## Testing models and migrations
As we create an example test, we're going to follow some of the basics of test-driven-development (TDD) here. Whether or not you practice TDD in your normal workflow, explaining the steps here helps expose possible problems you might encounter along the way, thus making your own troubleshooting simpler. Let's get started:

### Writing a unit test
Now that we’ve got **PHPunit** set up, let’s create a unit test for our Post model in the `tests/Unit` directory called `PostTest.php`. Let's write a test that verifies a `Post` has a title:

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
    $post = factory(Post::class)->create(['title' => 'Fake Title']);
    $this->assertEquals('Fake Title', $post->title);
  }
}
```

Note: we're using the `RefreshDatabase` trait to be sure that we start with a clean database state before every test.

### Running the tests
We can run our test suite by calling the phpunit binary in our vendor directory using `./vendor/bin/phpunit`. However, let’s alias this to `test` in our `composer.json` file by adding a “script”:

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

Now, we can run `composer test` to run all of our tests and `composer test-f` followed by a name of a test method to only run that test.

When we run `composer test-f a_post_has_a_title`, it leads us to the following error:

```
InvalidArgumentException: Unable to locate factory with name [default] [JohnDoe\BlogPackage\Models\Post].
```

This tells us that we need to create a model factory for the `Post` model.

### Creating a model factory
Let’s create a `PostFactory` in the `database/factories` folder:

```php
// 'database/factories/PostFactory.php'
<?php

use JohnDoe\BlogPackage\Models\Post;
use Faker\Generator as Faker;

$factory->define(Post::class, function (Faker $faker) {
  return [
    //
  ];
});
```

However, the tests will still fail since we haven’t created the `posts` table in our in-memory sqlite database yet. We need to tell our tests to first perform all migrations, before running the tests. 

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
    $table->bigIncrements('id');
    $table->string('title');
    $table->timestamps();
});
```

After running the test, you should see it passing.

### Adding tests for other columns
Let’s add tests for the “body” and “author_id”:

```php
// 'tests/Unit/PostTest.php'
class PostTest extends TestCase
{
  use RefreshDatabase;
﻿
  /** @test */
  function a_post_has_a_title()
  {
    $post = factory(Post::class)->create(['title' => 'Fake Title']);
    $this->assertEquals('Fake Title', $post->title);
  }

  /** @test */
  function a_post_has_a_body()
  {
    $post = factory(Post::class)->create(['title' => 'Fake Body']);
    $this->assertEquals('Fake Title', $post->body);
  }

  /** @test */
  function a_post_has_an_author_id()
  {
    // Note that we are not assuming relations here, just that we have a column to store the 'id' of the author
    $post = factory(Post::class)->create(['author_id' => 999]); // we choose an off-limits value for the author_id so it is unlikely to collide with another author_id in our tests
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

use Faker\Generator as Faker;
use JohnDoe\BlogPackage\Models\Post;

$factory->define(Post::class, function (Faker $faker) {
    return [
        'title'     => $faker->words(3),
        'body'      => $faker->paragraph,
        'author_id' => 999,
    ];
});
```

For now, we hard coded the ‘author_id’, but in the next section we'll see how we could whip up a relationship with a User model.

```php
// 'database/migrations/create_posts_table.php.stub'

Schema::create('posts', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->string('title');
    $table->text('body');
    $table->unsignedBigInteger('author_id');
    $table->timestamps();
});
```

## Models related to App\User
Now that we have an “author_id” column on our `Post` model, let’s create a relationship between a `Post` and a `User`. However … we have a problem, since we need a `User` model, but this model also comes out-of-the-box with a fresh installation of the Laravel framework…

We can’t just provide our own `User` model, since you likely want your end user to be able to hook up his own `User` model with your `Post` model. Or even better, let the end user decide which model they want to associate with the `Post` model.

### Using a polymorphic relationship
Instead of opting for a conventional one-to-many relationship (a user can have many posts, and a post belongs to a user), we’ll use a **polymorphic** one-to-many relationship where a `Post` morphs to a certain related model (not necessarily a `User` model).

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

After adding this `author()` method to our Post model, we need to update our `create_posts_table_migration.php.stub` file to reflect our polymorphic relationship. Since we named the method “author”, Laravel expects an “author_id” and an “author_type” field. The latter contains a string of the namespaced model we are referring to (for example “App\User”).

```php
Schema::create('posts', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->string('title');
    $table->text('body');
    $table->unsignedBigInteger('author_id');
    $table->string('author_type');
    $table->timestamps();
});
```

Now, we need a way to provide our end user with the option to allow certain models to be able to have relationship with our `Post` model. **Traits** offer an excellent solution for this exact purpose.

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

Now the end user can add a `use HasPosts` statement to any of their models (likely the `User` model) which would automatically register the one-to-many relationship with our `Post` model. This allows creating new posts as follows:

```php
// Given we have a User model, using the HasPosts trait
$user = User::first();

// We can create a new post from the relationship
$user->posts()->create([
  'title' => 'Some title',
  'body' => 'Some body',
]);
```

### Testing the polymorphic relationship
Of course, we want to prove that any model using our `HasPost` trait can indeed create new posts and that those posts are stored correctly.

Therefore, we’ll create a new `User` model, not within the `src/Models/` directory, but rather in our `tests/` directory. 

In the `User` model we’ll use the same traits that would be available on the `User` model that ships with a standard Laravel project to stay close to a real world scenario. Also, we use our own `HasPosts` trait:

```php
// 'tests/User.php'
<?php

namespace JohnDoe\BlogPackage\Tests;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use JohnDoe\BlogPackage\Traits\HasPosts;

class User extends Model implements AuthorizableContract, AuthenticatableContract
{
    use HasPosts, Authorizable, Authenticatable;

    protected $guarded = [];

    protected $table = 'users';
}
```

Now that we have a `User` model, we also need to add a new migration (the standard users table migration that ships with Laravel) to our database`/migrations` as `create_users_table.php.stub`:

```php
// 'database/migrations/create_users_table.php.stub'
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

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
            $table->bigIncrements('id');
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

### Updating our Post model factory
Now that we can whip up `User` models with our new factory, let’s create a new `User` in our `PostFactory` and then assign it to “author_id” and “author_type”:

```php
// 'database/factories/PostFactory.php'
<?php

namespace JohnDoe\BlogPackage\Database\Factories;

use Faker\Generator as Faker;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Tests\User;

$factory->define(Post::class, function (Faker $faker) {
    $author = factory(User::class)->create();
    
    return [
        'title'         => $faker->words(3),
        'body'          => $faker->paragraph,
        'author_id'     => $author->id,
        'author_type'   => get_class($author),
    ];
});
```

Next we update the `Post` unit test, to also verify an ‘author_type’ can be specified.

```php
// 'tests/Unit/PostTest.php'
class PostTest extends TestCase
{
  // other tests...

  /** @test */
  function a_post_has_an_author_type()
  {
    $post = factory(Post::class)->create(['author_type' => 'Fake\User']);
    $this->assertEquals('Fake\User', $post->author_type);
  }
}
```

Finally, we need to verify that our test `User` can create a `Post` and that it is stored correctly. 

Since we are not creating a new post using a call to a specific route in the application, let's store this test also in the `Post` unit test. In the next section on “Routes & Controllers”, we’ll make a POST request to an endpoint to create a new `Post` model and therefore divert to a Feature test.

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
    $author = factory(User::class)->create();
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

At this stage all of the tests should be passing.


