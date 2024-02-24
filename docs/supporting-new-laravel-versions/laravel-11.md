---
title: "Upgrading to laravel 11"
description: "Learn how to upgrade your package to laravel 11. Easy guide to laravel 11 upgrade for laravel packages."
tags: ["laravel", "laravel 11", ""]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2024-02-24
---
# Laravel 11

Laravel 11 is around the corner as of writing this guide (23 feb 2024)! We hope you are as excited as we are.
Supporting laravel 11 is probably going to be very easy for you as a package maintainer and should only take 30 minutes max!
We wrote down some of the important to know things and show you how you support this new release.

## Important items from the upgrade guide 
Please read the full upgrade guide as many of the changes are very specific but the biggest ones we will highlight in the next sections.
See full guide here: [https://laravel.com/docs/master/upgrade](https://laravel.com/docs/master/upgrade)

### PHP 8.2 requirement
Laravel 11 requires php 8.2 which allows for some new features, check them out here: [https://www.php.net/releases/8.2/en.php](https://www.php.net/releases/8.2/en.php)
Be aware that you probably want to continue supporting older versions of laravel / php as laravel itself does. 
At the time of writing the laravel team support laravel 10 ( php 8.1 - 8.3 ) and laravel 11 ( php 8.2 - 8.3 ).

### Removal of config directory for new projects
Laravel 11 ships with a new skeleton which removes the config directory, if your package supports a config then dont be worried. 
The existing config directory is not going away but you might have to let users know that they can generate the config directory using the following command:
```php artisan config:publish```


## Testing if your package is ready
Your package is probably hosted on GitHub which has GitHub Actions, using the following example github action runner file you can test if your package is ready / supports laravel 11 and other versions.
```yaml
name: run-tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: true
      matrix:
        os: [ ubuntu-latest ]
        php: [ 8.1, 8.2 ]
        laravel: [ 9.*, 10.*, 11.* ]
        stability: [ prefer-stable ]
        include:
          - laravel: 9.*
            testbench: ^7.0
          - laravel: 10.*
            testbench: ^8.0
          - laravel: 11.*
            testbench: ^9.0
        exclude:
          - laravel: 10.*
            php: 8.0
          - laravel: 11.*
            php: 8.1

    name: PHP${{ matrix.php }} - LARAVEL${{ matrix.laravel }} - ${{ matrix.stability }} - ${{ matrix.os }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, bcmath, soap, intl, gd, exif, iconv, imagick, fileinfo
          coverage: none

      - name: Setup problem matchers
        run: |
          echo "::add-matcher::${{ runner.tool_cache }}/php.json"
          echo "::add-matcher::${{ runner.tool_cache }}/phpunit.json"
      - name: Install dependencies
        run: |
          composer require "laravel/framework:${{ matrix.laravel }}" "orchestra/testbench:${{ matrix.testbench }}" --no-interaction --no-update
          composer update --${{ matrix.stability }} --prefer-dist --no-interaction
      - name: Execute tests
        run: vendor/bin/phpunit
```

## Community feedback
As you might have seen on Twitter/X or Reddit people are excited to play around with the new laravel 11 release.
To make sure your package helps them enjoy it we recommend updating your package before laravel 11 releases. 
