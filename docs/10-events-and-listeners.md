# Events & Listeners

Your package may want to offer support for hooking into Laravel's Events and Listeners.

Laravel's events provide a way to hook into a certain activity that took place in your application. They can be emitted/dispatched using the `event()` helper, which accepts an `Event` class as a parameter. After an event is dispatched, the `handle()` method of all registered Listeners will be triggered. The listeners for a certain event are defined in the application's event service provider. An event-driven approach might help to keep the code loosely coupled.

It is not uncommon that packages emit events upon performing a certain task. The end user may or may not register his own listeners for an event you submit within a package. However, sometimes you might also want to listen within your package to your own events. For this we'll need _our own event service provider_ and that's what we're looking at in this section.

## Creating a New Event

First let's emit an event whenever a new `Post` is created via the route we set up earlier.

In a new `Events` folder in the `src/` directory, create a new `PostWasCreated.php` file. In the `PostWasCreated` event class we'll accept the `Post` that was created in the constructor and save it to a _public_ instance variable `$post`.

```php
// 'src/Events/PostWasCreated.php'
<?php

namespace JohnDoe\BlogPackage\Events;

use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use JohnDoe\BlogPackage\Models\Post;

class PostWasCreated
{
    use Dispatchable, SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }
}
```

When creating a new `Post` in the `PostController`, we can now emit this event (don't forget to import it):

```php
// 'src/Http/Controllers/PostController.php'
<?php

use JohnDoe\BlogPackage\Events\PostWasCreated;

class PostController extends Controller
{
  public function store()
  {
    // authentication and validation checks...

    $post = $author->posts()->create([...]);

    event(new PostWasCreated($post));

    return redirect(...);
  }
}
```

### Testing the Event was Emitted

To be sure this event is successfully fired, add a test to our `CreatePostTest` _feature_ test. We can easily fake Laravel's `Event` facade and make assertions (see [Laravel documentation on Fakes](https://laravel.com/docs/mocking#event-fake)) that the event was emitted **and** about the passed `Post` model.

```php
// 'tests/Feature/CreatePostTest.php'
use Illuminate\Support\Facades\Event;
use JohnDoe\BlogPackage\Events\PostWasCreated;
use JohnDoe\BlogPackage\Models\Post;

class CreatePostTest extends TestCase
{
  use RefreshDatabase;

  // other tests

  /** @test */
  function an_event_is_emitted_when_a_new_post_is_created()
  {
      Event::fake();

      $author = factory(User::class)->create();

      $this->actingAs($author)->post(route('posts.store'), [
        'title' => 'A valid title',
        'body' => 'A valid body',
      ]);

      $post = Post::first();

      Event::assertDispatched(PostWasCreated::class, function ($event) use ($post) {
          return $event->post->id === $post->id;
      });
  }
}
```

Now that we know that our event is fired correctly, let's hook up our own listener.

## Creating a New Listener

After a `PostWasCreated` event was fired, let's modify the title of our post, for demonstrative purposes. In the `src/` directory, create a new folder `Listeners`. In this folder, create a new file that describes our action: `UpdatePostTitle.php`:

```php
// 'src/Listeners/UpdatePostTitle.php'
<?php

namespace JohnDoe\BlogPackage\Listeners;

use JohnDoe\BlogPackage\Events\PostWasCreated;

class UpdatePostTitle
{
    public function handle(PostWasCreated $event)
    {
        $event->post->update([
            'title' => 'New: ' . $event->post->title
        ]);
    }
}
```

## Testing the Listener

Although we've tested correct behaviour when the `Event` is emitted, it is still worthwhile to have a separate test for the event's listener. If something breaks in the future, this test will lead you directly to the root of the problem: the listener.

In this test, we'll assert that the listener's `handle()` method indeed changes the title of a blog post (in our silly example) by instantiating the `UpdatePostTitle` listener and passing a `PostWasCreated` event to its `handle()` method:

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function a_newly_created_posts_title_will_be_changed()
{
    $post = factory(Post::class)->create([
        'title' => 'Initial title',
    ]);

    $this->assertEquals('Initial title', $post->title);

    (new UpdatePostTitle())->handle(
        new PostWasCreated($post)
    );

    $this->assertEquals('New: ' . 'Initial title', $post->fresh()->title);
}
```

Now that we have a passing test for emitting the event, and we know that our listener shows the right behaviour handling the event, let's couple the two together and create a custom Event Service Provider.

## Creating an Event Service Provider

Just like in Laravel, our package can have multiple service providers as long as we load them in our main application service provider (in the next section).

First, create a new folder `Providers` in the `src/` directory. Add a file called `EventServiceProvider.php` and register our Event and Listener:

```php
// 'src/Providers/EventServiceProvider.php'
<?php

namespace JohnDoe\BlogPackage\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JohnDoe\BlogPackage\Events\PostWasCreated;
use JohnDoe\BlogPackage\Listeners\UpdatePostTitle;

class EventServiceProvider extends ServiceProvider
{

    protected $listen = [
        PostWasCreated::class => [
            UpdatePostTitle::class,
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
    }
}
```

## Registering the Event Service Provider

In our main `BlogPackageServiceProvider` we need to register our Event Service Provider in the `register()` method, as follows (don't forget to import it):

```php
// 'BlogPackageServiceProvider.php'
use JohnDoe\BlogPackage\Providers\EventServiceProvider;

public function register()
{
  $this->app->register(EventServiceProvider::class);
}
```

## Testing the Event/Listener Cascade

Earlier we faked the `Event` facade, but in this test we would like to confirm that an event was fired that led to a handle method on a listener and that eventually changed the title of our `Post`, exactly like we'd expect. The test assertion is easy: just assume that the title was changed after creating a new post. We'll add this method to the `CreatePostTest` feature test:

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function the_title_of_a_post_is_updated_whenever_a_post_is_created()
{
    $author = factory(User::class)->create();

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => 'A valid title',
        'body' => 'A valid body',
    ]);

    $post = Post::first();

   $this->assertEquals('New: ' . 'A valid title', $post->title);
}
```

This test is green, but what if we run the full suite?

## Fixing the Failing Test

If we run the full suite with `composer test`, we see we have one failing test:

```php
There was 1 failure:

1) JohnDoe\BlogPackage\Tests\Feature\CreatePostTest::authenticated_users_can_create_a_post
Failed asserting that two strings are equal.
--- Expected
+++ Actual
@@ @@
-'My first fake title'
+'New: My first fake title'
```

This is a regression from the Event we've introduced. There are two ways to fix this error:

1. change the expected title in the authenticated_users_can_create_a_post test
2. by faking any events before the test is run which inhibits the actual handlers to be called

It is very situational what happens to be the best option but let's go with **option 2** for now.

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function authenticated_users_can_create_a_post()
{
    Event::fake();

    $this->assertCount(0, Post::all());
    // the rest of the test... 
```

All tests are green, so let's move on to the next topic.
