# Routing

Sometimes you want to expose additional routes to the end user of your package.

Since we're offering a `Post` model, let's add some **RESTful** routes. To keep things simple, we're just going to implement 3 of the RESTful routes:

- showing all posts ('index')
- showing a single post ('show')
- storing a new post ('store')

## Controllers

### Creating a base controller

We want to create a `PostController`.

To make use of some traits the Laravel controllers offer, we'll first create our own base controller containing these traits in a `src/Http/Controllers` directory (resembling Laravel's folder structure) named `Controller.php`:

```php
// 'src/Http/Controllers/Controller.php'
<?php

namespace JohnDoe\BlogPackage\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
```

### Creating a controller that extends base controller

Now, let's create a PostController in the `src/Http/Controllers` directory, starting first with the 'store' method:

```php
// 'src/Http/Controllers/PostController'
<?php

namespace JohnDoe\BlogPackage\Http\Controllers;

class PostController extends Controller
{
    public function index()
    {
        //
    }

    public function show()
    {
        //
    }

    public function store()
    {
        // Let's assume we need to be authenticated
        // to create a new post
        if (! auth()->check()) {
            abort (403, 'Only authenticated users can create new posts.');
        }

        request()->validate([
            'title' => 'required',
            'body'  => 'required',
        ]);

        // Assume the authenticated user is the post's author
        $author = auth()->user();

        $post = $author->posts()->create([
            'title'     => request('title'),
            'body'      => request('body'),
        ]);

        return redirect(route('posts.show', $post));
    }
}
```

## Routes

### Defining routes

Now that we have a controller, create a new `routes/` directory in the root of our package and add a `web.php` file containing the three RESTful routes we've mentioned above.

```php
// 'routes/web.php'
<?php

use Illuminate\Support\Facades\Route;
use JohnDoe\BlogPackage\Http\Controllers\PostController;

Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
```

### Registering routes in the service provider

Before we can use these routes, we need to register them in the `boot()` method of our Service Provider:

```php
// 'BlogPackageServiceProvider.php'
public function boot()
{
  // ... other things
  $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

### Configurable route prefix and middleware

You may want to allow users to define a route prefix and/or middleware for the routes exposed by your package. Instead of registering the routes directly in the `boot()` method we'll register the routes using `Route::group`, passing in the dynamic configuration (prefix and middleware). Don't forget to import the corresponding `Route` facade.

In the following example, a namespace of `blogpackage` is used. Don't forget to replace this with your package's own namespace.

```php
// 'BlogPackageServiceProvider.php'
use Illuminate\Support\Facades\Route;

public function boot()
{
  // ... other things
  $this->registerRoutes();
}

protected function registerRoutes()
{
    Route::group($this->routeConfiguration(), function () {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    });
}

protected function routeConfiguration()
{
    return [
        'prefix' => config('blogpackage.prefix'),
        'middleware' => config('blogpackage.middleware'),
    ];
}
```

Specify a default route prefix and middleware in the package's `config.php` file:

```php
'prefix' => 'blogger',
'middleware' => ['web'], // you probably want to include 'web' here
```

Using the above default configuration, all routes defined in `routes.web` need to be prefixed with `/blogger`. In this way, collision with potentially existing routes can be avoided.

## Views

The 'index' and 'show' methods on the PostController need to render a view.

### Creating the blade view files

Create a new `resources/` folder in the root of our package. In that folder, create a subfolder named `views`. In the views folder we'll create a `posts` subfolder in which we'll create two (extremely) simple templates.

1. `resources/views/posts/index.blade.php`:

   ```
   <h1>Showing all Posts</h1>

   @forelse ($posts as $post)
       <li>{{ $post->title }}</li>
   @empty
       <p> 'No posts yet' </p>
   @endforelse
   ```

2. `resources/views/posts/show.blade.php`:

   ```
   <h1>{{ $post->title }}</h1>

   <p> {{ $post->body }}</p>
   ```

Note: these templates would extend a base / master layout file in a real world scenario.

### Register views in the service provider

Now that we have some views, we need to register that we want to load any views from our `resources/views` directory in the `boot()` method of our Service Provider. **Important**: provide a "key" as the second argument to `loadViewsFrom()` as you'll need to specify this key when returning a view from a controller (see next section).

```php
// 'BlogPackageServiceProvider.php'
public function boot()
{
  // ... other things
  $this->loadViewsFrom(__DIR__.'/../resources/views', 'blogpackage');
}
```

### Returning a view from the controller

We can now just return the views we've created from the `PostController` (don't forget to import our `Post` model).

Note the `blogpackage::` prefix, which matches the prefix we registered in our Service Provider.

```php
// 'src/Http/Controllers/PostController.php'
use JohnDoe\BlogPackage\Models\Post;

public function index()
{
    $posts = Post::all();

    return view('blogpackage::posts.index', compact('posts'));
}

public function show()
{
    $post = Post::findOrFail(request('post'));

    return view('blogpackage::posts.show', compact('post'));
}
```

### Customizable views

Chances are that you want to be able to let the users of your package _customize_ the views. Similar to the database migrations, the views can be **published** if we register them to be exported in the `boot()` method of our service provider using the 'views' key of the publishes() method:

```php
// 'BlogPackageServiceProvider.php'
if ($this->app->runningInConsole()) {
  // publish database migrations

  $this->publishes([
    __DIR__.'/../resources/views' => resource_path('views/vendor/blogpackage'),
  ], 'views');

}
```

The views can then be exported by users of our package using:

```
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="views"
```

## Assets

It is likely that you'll want to include a CSS and/or javascript file when you're adding views to your package.

### Creating an 'assets' directory

If you want to use a CSS stylesheet and/or include a javascript file in your views, create an `assets` directory in the `resources/` folder. Since we might include several stylesheets and/or javascript files let's create **two subfolders**: `css` and `js` to store these files respectively. A convention is to name the main javascript file `app.js` and the main stylesheet `app.css`.

### Customizable assets

Just like the views, we can let our users customize the assets if they want. First, we'll determine where we'll export the assets in the `boot()` method of our service provider under the 'assets' key in a 'blogpackage' directory in the public path of the end user's Laravel app:

```php
// 'BlogPackageServiceProvider.php'
if ($this->app->runningInConsole()) {
  // publish database migrations

  // publish views

  $this->publishes([
    __DIR__.'/../resources/assets' => public_path('blogpackage'),
  ], 'assets');

}
```

The assets can then be exported by users of our package using:

```
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="assets"
```

### Referencing the assets

We can reference the stylesheet and javascript file in our views as follows:

```html
<script src="{{ asset('blogpackage/js/app.js') }}"></script>
<link href="{{ asset('blogpackage/css/app.css') }}" rel="stylesheet" />
```

## Testing Routes

Let’s verify that we can indeed create a post, show a post and show all posts with our provided routes, views and controllers.

### Feature test

Create a new Feature test called `CreatePostTest.php` in the `tests/Feature` directory and add the following assertions to verify that authenticated users can indeed create new posts:

```php
// 'tests/Feature/CreatePostTest.php'
<?php

namespace JohnDoe\BlogPackage\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Tests\TestCase;
use JohnDoe\BlogPackage\Tests\User;

class CreatePostTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    function authenticated_users_can_create_a_post()
    {
        // To make sure we don't start with a Post
        $this->assertCount(0, Post::all());

        $author = User::factory()->create();

        $response = $this->actingAs($author)->post(route('posts.store'), [
            'title' => 'My first fake title',
            'body'  => 'My first fake body',
        ]);

        $this->assertCount(1, Post::all());

        tap(Post::first(), function ($post) use ($response, $author) {
            $this->assertEquals('My first fake title', $post->title);
            $this->assertEquals('My first fake body', $post->body);
            $this->assertTrue($post->author->is($author));
            $response->assertRedirect(route('posts.show', $post));
        });
    }
}
```

Additionally, we could verify that we require both a "title" and a "body" attribute when creating a new post:

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function a_post_requires_a_title_and_a_body()
{
    $author = factory(User::class)->create();

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => '',
        'body'  => 'Some valid body',
    ])->assertSessionHasErrors('title');

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => 'Some valid title',
        'body'  => '',
    ])->assertSessionHasErrors('body');
}
```

Next, let's verify that unauthenticated users (or "guests") can not create new posts:

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function guests_can_not_create_posts()
{
    // We're starting from an unauthenticated state
    $this->assertFalse(auth()->check());

    $this->post(route('posts.store'), [
       'title' => 'A valid title',
       'body'  => 'A valid body',
    ])->assertForbidden();
}
```

Finally, let's verify the index route shows all posts, and the show route shows a specific post:

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function all_posts_are_shown_via_the_index_route()
{
    // Given we have a couple of Posts
    factory(Post::class)->create([
        'title' => 'Post number 1'
    ]);
    factory(Post::class)->create([
        'title' => 'Post number 2'
    ]);
    factory(Post::class)->create([
        'title' => 'Post number 3'
    ]);

    // We expect them to all show up
    // with their title on the index route
    $this->get(route('posts.index'))
        ->assertSee('Post number 1')
        ->assertSee('Post number 2')
        ->assertSee('Post number 3')
        ->assertDontSee('Post number 4');
}

/** @test */
function a_single_post_is_shown_via_the_show_route()
{
    $post = factory(Post::class)->create([
        'title' => 'The single post title',
        'body'  => 'The single post body',
    ]);

    $this->get(route('posts.show', $post))
        ->assertSee('The single post title')
        ->assertSee('The single post body');
}
```

> Tip: whenever you are getting cryptic error messages from your tests, it might be helpful to disable graceful exception handling to get more insight into the origin of the error. You can do so by declaring `$this->withoutExceptionHandling();` at the start of your test.
