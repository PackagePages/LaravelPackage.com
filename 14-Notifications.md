Notifications are a powerful tool in Laravel's toolbox as they provide support for sending notifications to an array of different services including mail, SMS, Slack or storing them in your database to show on the user's profile page for example.

# Creating a Notification

To start using Notifications in your package, first create a `Notifications` directory in the `src/` directory of your package. Next, for this example, add a `PostWasPublishedNotification.php` which for example notifies the author of the `Post` that his submission was approved.

```php
<?php

namespace JohnDoe\BlogPackage\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use JohnDoe\BlogPackage\Models\Post;

class PostWasPublishedNotification extends Notification
{
    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line("Your post '{$this->post->title}' was accepted")
            ->action('Notification Action', url("/posts/{$this->post->id}"))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
```

# Testing Notifications

In the test:

* Swap the `Notification` facade with a mock using the `fake()` helper.
* Assert no notifications have been sent before calling the `notify()` method.
* Notify the `User` model via `$user->notify()` (which needs to use the `Notifiable` trait).
* Assert that the notification was sent and contains the correct `Post` model. 

```php
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Support\Facades\Notification;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Notifications\PostWasPublishedNotification;
use JohnDoe\BlogPackage\Tests\TestCase;
use JohnDoe\BlogPackage\Tests\User;

class NotifyPostWasPublishedTest extends TestCase
{
    /** @test */
    public function it_can_notify_a_user_that_a_post_was_published()
    {
        Notification::fake();
        
        $post = factory(Post::class)->create();

        // the User model has the 'Notifiable' trait
        $user = factory(User::class)->create();

        Notification::assertNothingSent();

        $user->notify(new PostWasPublishedNotification($post));

        Notification::assertSentTo(
            $user,
            PostWasPublishedNotification::class,
            function ($notification) use ($post) {
                return $notification->post->id === $post->id;
            }
        );
    }
}
```

With the test passing, you can safely use this notification in your package.

# Custom notification channels
Additionally, you may configure the channels for the notification to be dependent on the configuration file of your package to allow your users to specify which notification channels they want to use. 

```php
public function via($notifiable)
{
    return config('blogpackage.notifications.channels');
}
```