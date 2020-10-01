# Introduction

In my experience, learning to develop a package for Laravel can be quite challenging which is why I previously wrote [a blog series about that](https://johnbraun.blog/posts/creating-a-laravel-package-1).

Over time, I began thinking this topic deserves its own manual, rather than a couple of posts which only cover _my_ insights. That's where I think this e-book type of guide will come in. I've bundled up my blog posts and expanded on a couple of more topics in separate chapters. These chapters are available on GitHub and contributions (in the form of pull requests) are highly welcomed. I hope that this website can become a place to share knowledge on Laravel package development to help developers get a head start.

You are highly encouraged to participate and [contribute to this project](https://github.com/Jhnbrn90/LaravelPackage.com). Please feel free to submit a PR, even only for a typo.

First of all, I want to thank Marcel Pociot. His very clear, structured and detailed PHP Package Development [video course](https://phppackagedevelopment.com/) helped me quickly getting started on developing my own packages. I can highly recommend his video course if you want to learn how to create (framework agnostic) PHP packages.

## Reasons to develop a package

You might encounter a scenario where you want to reuse some feature(s) of your application in other applications, open source a certain functionality or just keep related code together but separate it from your main application. In those cases, it makes sense to extract parts to a package. Packages or “libraries” provide an easy way to add additional functionality to existing applications, and are mostly focused on a single feature.

## Composer & Packagist

At the time of writing, there are nearly 240,000 packages available on [Packagist](https://packagist.org/), the main repository for PHP packages.

Packages are downloaded and installed using [Composer](https://getcomposer.org/) - PHP’s package management system - which manages dependencies within a project.

To install a package in your existing Laravel project, the `composer require <vendor>/<package>` command will download all necessary files into a `/vendor` directory of your project where all your third party packages live, separated by vendor name. As a consequence, the content from these packages is separated from your application code which means this piece of code is maintained by someone else, most often by creator of that package. Whenever the package needs an update, run `composer update` to get the latest (compatible) version of your packages.

## Tools for developing a package

In the first chapter, the basic structure of a package will be addressed. Now, it can be cumbersome to set-up the basic skeleton every time from scratch. That's why others created some helpful tools.

- [Laravel Package Boilerplate](https://laravelpackageboilerplate.com/)
  This tool by Marcel Pociot, allows you to generate a basic template for Laravel specific as well as generic PHP packages which can be downloaded as a `.zip` file.

- [Laravel Packager](https://github.com/Jeroen-G/laravel-packager)
  This package by Jeroen-G provides a CLI tool to quickly scaffold packages, from within an existing Laravel application. It will take care of some of the necessary set-up as is discussed through later chapters. The package was featured recently on [Laracasts](https://laracasts.com/series/building-laracasts/episodes/3).

- [Laravel Packager Hermes](https://github.com/DelveFore/laravel-packager-hermes)
  This package by DelveFore is an extension of the Laravel Packager package, enabling usage of Artisan commands within that package to quickly generate Laravel specific classes. Currently, it only supports the scaffolding of `Controllers`.

- [Laravel Package Tools](https://github.com/beyondcode/laravel-package-tools)
  Like the previously mentioned package, this package by Marcel Pociot is aimed at providing Artisan commands from within Laravel packages to quickly scaffold `Commands`, `Requests`, `Jobs`, `Events`, etc.

- [Orchestral Canvas](https://github.com/orchestral/canvas)
  The Orchestral Canvas package offers code generators and replicates all of the `make` artisan commands available in your basic Laravel application.

- [Yeoman Laravel Package Scaffolder](https://github.com/verschuur/generator-laravel-package-scaffolder)
  This package provides a standalone generator to quickly scaffold a Laravel package. It will generate a skeleton structure, a ready-to-go composer.json file and a fully configured service provider. Just uncomment what you need and start developing.

- [Laravel Packer](https://github.com/bitfumes/laravel-packer)
  A PHP package offering a command-line tool to scaffold a basic package directory structure and `composer.json` file and provides the `make` artisan commands within your package.
