---
title: 'Introduction'
description: 'Learn to create Laravel specific PHP packages from scratch, following this open documentation. Contributions are welcomed.'
tags: ['Laravel', 'PHP Package', 'Package Development']
image: 'https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg'
date: 2019-09-17
---

# Introduction to Package Development

In my experience, learning to develop a package for Laravel can be quite challenging, which is why I previously wrote [a blog series about that](https://johnbraun.blog/posts/creating-a-laravel-package-1).

Over time, I began thinking this topic deserves proper documentation, rather than a couple of posts that only cover _my_ insights. That's where I feel this open-source documentation on Laravel Package Development will come in. I've bundled up my blog posts and expanded on a couple of more topics in separate chapters. Contributions (in the form of pull requests) are highly welcomed and appreciated. I hope this website can become a place to share knowledge on Laravel package development to help developers get a head start.

You are highly encouraged to participate and [contribute to this project](https://github.com/Jhnbrn90/LaravelPackage.com). Please feel free to submit a PR, even only for a typo.

First of all, I want to thank Marcel Pociot. His clear and structured [video course](https://phppackagedevelopment.com/) encouraged me to create PHP packages myself. I can highly recommend his video course if you want to learn how to make (framework agnostic) PHP packages.

--- 

💡 Would you rather watch than read? The famous and reputable package builders from **Spatie** launched a full video course on [Laravel Package Development](https://laravelpackage.training).

## Reasons to Develop a Package

You might encounter a scenario where you want to reuse some feature(s) of your application in other applications, open-source a specific functionality or keep related code together but separate it from your main application. In those cases, it makes sense to extract parts to a package. Packages or "libraries" provide an easy way to add additional functionality to existing applications and focus on a single feature.

## Companion Package
In this documentation, we'll build a demo package along the way (called "BlogPackage") by introducing the listed functionalities one-by-one. Make sure to check out the finished version of this [companion package](https://github.com/Jhnbrn90/BlogPackage) to have a handy reference, for example, when something doesn't work as expected. The demo package contains a test suite comprising unit and feature tests for the covered topics.

## Composer & Packagist

There are nearly 240,000 packages available on [Packagist](https://packagist.org/), the primary repository for PHP packages at the time of writing.

Packages are downloaded and installed using [Composer](https://getcomposer.org/) - PHP's package management system - which manages dependencies within a project.

To install a package in your existing Laravel project, the `composer require <vendor>/<package>` command will download all necessary files into a `/vendor` directory of your project where all your third party packages live, separated by vendor name. Consequently, the content from these packages is separated from your application code, which means this particular code is maintained by someone else, most often by the creator of that package. Whenever the package needs an update, run `composer update` to get the latest (compatible) version of your packages.

## Tools and Helpers

The first chapter will address the basic structure of a package. While it is good to understand the general structure of a package, check out one of the following helpful tools to instantly set-up the basic skeleton.

- [Package Skeleton by Spatie](https://github.com/spatie/package-skeleton-laravel)
  This package skeleton by Spatie offers a great starting point for setting up a Laravel package from scratch. Besides the essential components of a Laravel Package, the skeleton comes with a GitHub specific configuration including a set of (CI) workflows for GitHub actions. They also offer a skeleton for [generic PHP packages](https://github.com/spatie/package-skeleton-php).

- [Laravel Package Boilerplate](https://laravelpackageboilerplate.com/)
  This tool by Marcel Pociot allows you to generate a basic template for Laravel specific and generic PHP packages that can be downloaded as a `.zip` file.

- [Laravel Packager](https://github.com/Jeroen-G/laravel-packager)
  This package by Jeroen-G provides a CLI tool to quickly scaffold packages from within an existing Laravel application. The package was featured on [Laracasts](https://laracasts.com/series/building-laracasts/episodes/3) in the *Building Laracasts series*.

- [Laravel Packager Hermes](https://github.com/DelveFore/laravel-packager-hermes)
  This package by DelveFore is an extension of the Laravel Packager package, enabling usage of Artisan commands within that package to quickly generate Laravel specific classes. Currently, it only supports the scaffolding of `Controllers`.

- [Laravel Package Tools](https://github.com/beyondcode/laravel-package-tools)
  Like the previously mentioned package, Marcel Pociot's package aims to provide Artisan commands from within Laravel packages to quickly scaffold `Commands`, `Requests`, `Jobs`, `Events`, etc.

- [Orchestral Canvas](https://github.com/orchestral/canvas)
  The Orchestral Canvas package offers code generators and replicates all of the `make` artisan commands available in your basic Laravel application.

- [Yeoman Laravel Package Scaffolder](https://github.com/verschuur/generator-laravel-package-scaffolder)
  This package provides a standalone generator to quickly scaffold a Laravel package. It will generate a skeleton structure, a ready-to-go composer.json file, and a fully configured service provider. Just uncomment what you need and start developing.

- [Laravel Packer](https://github.com/bitfumes/laravel-packer)
  A PHP package offering a command-line tool to scaffold a basic package directory structure and `composer.json` file and provides the `make` artisan commands within your package.

- [Laravel Package Maker](https://github.com/naoray/laravel-package-maker)
  A PHP package that provides all the Laravel `make` commands for package development. It uses Composer's repositories feature to symlink your test app with your package to make testing as easy as possible.