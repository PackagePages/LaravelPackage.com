---
title: "Adding assets"
description: "Configuration needed to publish assets with your package and how to configure Vite in your package for dev and production."
tags: ["Assets", "Vite"]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2023-07-29
---

# Assets

You'll likely want to include a CSS and javascript file when you're adding views to your package.

### Creating an 'assets' Directory

If you want to use a CSS stylesheet or include a javascript file in your views, create an `assets` directory in the `resources/` folder. Since we might include several stylesheets or javascript files, let's create **two subfolders**: `css` and `js` to store these files, respectively. A convention is to name the main javascript file `app.js` and the main stylesheet `app.css`.

### Customizable Assets

Just like the views, we can let our users customize the assets if they want. First, we'll determine where we'll export the assets in the `boot()` method of our service provider under the 'assets' key in a 'blogpackage' directory in the public path of the end user's Laravel app:

```php title="BlogPackageServiceProvider.php"
<?php

if ($this->app->runningInConsole()) {
  // Publish assets
  $this->publishes([
    __DIR__.'/../resources/assets' => public_path('blogpackage'),
  ], 'assets');

}
```

The assets can then be exported by users of our package using:

```
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="assets"
```

### Referencing Assets

We can reference the stylesheet and javascript file in our views as follows:

```html
<script src="{{ asset('blogpackage/js/app.js') }}"></script>
<link href="{{ asset('blogpackage/css/app.css') }}" rel="stylesheet" />
```

### Vite config to build the package assets

Sometimes we want to build the assets using a bundler like Webpack or Vite.

The latest versions of Laravel switched from Webpack to Vite, and it would be nice to use the same bundler for the package
to support all the hot reload and dev features of Vite.

To do that we need to add Javascript packages using NPM.

1. If you don't have a package.json file already, run the `npm init -y` command to create one.
2. Install Vite and the laravel plugin `npm install -D vite laravel-vite-plugin`.
3. Create the same structure for the resources as a Laravel website.
4. Then create a vite.config.js

vite.config.js file content

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
  plugins: [
    laravel({
      hotFile: 'public/vendor/blogpackage/blogpackage.hot', // Most important lines
      buildDirectory: 'vendor/blogpackage', // Most important lines
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: true,
    }),
  ],
});
```

package.json

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "laravel-vite-plugin": "^0.7.8",
    "vite": "^4.3.9"
  }
}
```

Then you can use it like this in a blade template.

```php
{{ Vite::useHotFile('vendor/blogpackage/blogpackage.hot')
        ->useBuildDirectory("vendor/blogpackage")
        ->withEntryPoints(['resources/css/app.css', 'resources/js/app.js']) }}
```

This will then let us use the Vite dev server in a local project when developing the package.
We can also build the assets using Vite for production.

**For development, we will need to create a symlink of the public/vendor/blogpackage folder**

Example of a symlink command `mklink /J .\public\vendor\blogpackage .\vendor\johndoe\blogpackage\public\vendor\blogpackage`

And start the dev server of both projects, the laravel app and the package.

**For production, we will need to publish the assets**

Add this to your ServiceProvider

```php
$this->publishes([
    __DIR__.'/../public/vendor/blogpackage' => public_path('vendor/blogpackage'),
], 'assets');
```