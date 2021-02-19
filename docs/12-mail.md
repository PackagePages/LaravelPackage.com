---
title: 'Mail'
description: 'Send e-mail from your package by creating a custom Mailable class and template, utilizing the views provided by the package. Additionally, This chapter will cover testing of the Mail facade.'
tags: ['Mail', 'Mail template', 'Views', 'Mailables', 'Testing Mail']
image: 'https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg'
date: 2019-09-17
---

# Mail

Using e-mails in your package works very much the same as in a normal Laravel application. However, in your package, you need to make sure you are loading a `views` directory from your package (or the end-user's exported version of it).

To start sending e-mails, we need to create 1) a new **mailable** and 2) an e-mail **template**.

The e-mail template can be in either **markdown** or **blade** template format, as you're used to. In this example, we'll focus on writing a Blade template, however if you're using a markdown template replace the `$this->view('blogpackage::mails.welcome')` with a call to `$this->markdown('blogpackage::mails.welcome')`. Notice that we're using the namespaced view name, allowing our package users to export the views and update their contents.

## Creating a Mailable

First, add a new `Mail` folder in the `src/` directory, which will contain your mailables. Let's call it `WelcomeMail.php` mailable. Since we've been working with a `Post` model in the previous sections, let's accept that model in the constructor and assign it to a **public** `$post` property on the mailable.

```php
<?php
// 'src/Mail/WelcomeMail.php'

namespace JohnDoe\BlogPackage\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use JohnDoe\BlogPackage\Models\Post;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function build()
    {
        return $this->view('blogpackage::emails.welcome');
    }
}
```

## Registering the Views Directory

In the call to the mailable's `view()` method we've specified the string `emails.welcome`, which Laravel will translate to searching for a `welcome.blade.php` file in the `emails` directory in the package's registered views directory.

To specify a view directory, you need to add the `$this->loadViews()` call to your package's **service provider** in the `boot()` method. View files can be referenced by the specified namespace, in this example, 'blogpackage'. **Note: if you're following along since the section about **Routing**, you've already done this.**

```php
// 'BlogPackageServiceProvider.php'
public function boot()
{
  // ... other things
  $this->loadViewsFrom(__DIR__.'/../resources/views', 'blogpackage');
}
```

This will look for views in the `resources/views` directory in the root of your package.

## Creating a Blade Mail Template

Create the `welcome.blade.php` file in the `resources/views/emails` directory, where the `$post` variable will be freely available to use in the template.

```
// 'resources/views/emails/welcome.blade.php'
<p>
Dear reader,

Post title: {{ $post->title }}

-- Sent from the blogpackage
</p>
```

## Testing Mailing

To test that e-mailing works and the mail contains all the right information, [Laravel's Mail facade](https://laravel.com/docs/mocking#mail-fake) offers a built-in `fake()` method which makes it easy to swap the _real_ mailer for a mock in our tests.

To demonstrate how to test our e-mail, create a new `WelcomeMailTest` in the `tests/unit` directory. Next, in the test:

- Switch the Mail implementation for a mock using `Mail::fake()`.
- Create a `Post` using our factory (see section [Models and Migrations](#08-models-and-migrations)).
- Assert that at this stage, no e-mails are sent using `assertNothingSent()`.
- Send a new `WelcomeMail` mailable, passing in the `Post` model.
- Assert that the e-mail was sent and contains the correct `Post` model using `assertSent()`.

```php
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Support\Facades\Mail;
use JohnDoe\BlogPackage\Mail\WelcomeMail;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Tests\TestCase;

class WelcomeMailTest extends TestCase
{
    /** @test */
    public function it_sends_a_welcome_email()
    {
        Mail::fake();

        $post = Post::factory()->create(['title' => 'Fake Title']);

        Mail::assertNothingSent();

        Mail::to('test@example.com')->send(new WelcomeMail($post));

        Mail::assertSent(WelcomeMail::class, function ($mail) use ($post) {
            return $mail->post->id === $post->id
                && $mail->post->title === 'Fake Title';
        });
    }
}
```

With this passing test, you can be sure that your package can now send e-mails.