# Jobs

Much like the Mail facade in the previous section, implementing Jobs in your package is very similar to the workflow you'd go through in a Laravel application.

## Creating a Job

First, create a new `Jobs` directory in the `src/` directory of your package and add a `PublishPost.php` file, which will be responsible for updating the 'published_at' timestamp of a `Post`. The example below illustrates what the `handle()` method could look like:

```php
<?php

namespace JohnDoe\BlogPackage\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use JohnDoe\BlogPackage\Models\Post;

class PublishPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function handle()
    {
        $this->post->publish();
    }
}
```

## Testing Dispatching a Job

For this example, we have a `publish()` method on the `Post` model which is already under test (a unit test for `Post`). We can easily test the expected behaviour by adding a new `PublishPostTest.php` unit test in the `tests/unit` directory.

In this test, we can make use of the [`Bus` facade](https://laravel.com/docs/mocking#bus-fake) which offers a `fake()` helper to swap the real implementation with a mock. After dispatching the Job, we can make assertions on the `Bus` facade that our Job was dispatched and contains the correct `Post`.

```php
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Support\Facades\Bus;
use JohnDoe\BlogPackage\Jobs\PublishPost;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Tests\TestCase;

class PublishPostTest extends TestCase
{
    /** @test */
    public function it_publishes_a_post()
    {
        Bus::fake();

        $post = factory(Post::class)->create();

        $this->assertNull($post->published_at);

        PublishPost::dispatch($post);

        Bus::assertDispatched(PublishPost::class, function ($job) use ($post) {
            return $job->post->id === $post->id;
        });
    }
}
```

As the test passes, you can safely make use of this Job in the package.
