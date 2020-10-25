---
title: 'Publishing a Package'
description: 'Publish a package to Packagist, which allows the end user to pull in the package using Composer. Additionally, the section will cover semantic versioning and releasing newer versions of a package.'
tags: ['Publishing', 'Packagist', 'Composer', 'Semantic Versioning']
image: 'https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg'
date: 2019-09-17
---

# Publishing

Once satisfied with its functionality, you might want to share your package with a broader audience. This section will explain how to publish your package to the [Packagist](https://packagist.org) repository.

If you haven't already pushed your local git repository to a repository host (GitHub / GitLab / BitBucket / etc.) you should do so now. It is advisable to create an online repository with the same (package) name as defined in your `composer.json` file. Try to match these names, for example by renaming your package to follow this convention.

Given the example below, consumers would be able to require the package using `composer require johndoe/blogpackage` and find the corresponding repository at (if using GitHub) `github.com/johndoe/blogpackage`.

```json
{
  "name": "johndoe/blogpackage",
  "description": "A demo package",
  ...
}
```

The next step is to publish the git repository of the package to Packagist.

## Publishing on Packagist

To submit a package to Packagist, first [create an account](https://packagist.org/register/) and then use the [Submit link](https://packagist.org/packages/submit) and specify the **public** `repository URL` to the git repository of your package.

Packagist will now host a so called `dev-master` version of your package. Although anyone can access this package now through `composer require [vendor]/[package-name]`, the consumer will receive the package in its current state on the `master` branch. Since this means that **all** changes to `master` are immediately taking effect when consumers run `composer update`, this might lead to breaking changes. For projects which define a "stable" `minimum-stability` this means that your package will not be installed at all.

To prevent introducing breaking changes while still free to refactor our package, by convention **semantic versioning** is used to be able to discriminate between versions and thus compatibility.

## Releasing v1.0.0

Releases (and thus versions) of your package are tracked through **tags** on the corresponding git repository. Currently there is a `dev-master` release available through Packagist, which always points to the latest commit on the `master` branch of the repository. However, ideally we would like to serve the package in a fixed state to the consumer. This is where tags come in, which point to a specific commit.

To release version `1.0.0` of the package, first create a new tag in your git repository. If you're using GitHub you can do so by visiting the "releases" tab and "Create a new release". Provide a "Tag version" and "Release title" of `1.0.0` targeted at the current state of the `master` branch (serving as a pointer to the latest commit). Additionally you might provide information regarding this release in the description. After clicking "Publish release", Packagist will automatically update and reflect this new version. By default, consumers requiring the package without specifying a version will be served the latest tag/version/release which in this case will be `1.0.0`. You'll notice when you require this package in your project, the version constraint in `composer.json` will be `^1.0`, allowing `composer update` to download versions up to `1.x` (allowing minor and patch releases) but not `2.x` (major release, containing breaking changes). See the section below on semantic versioning for more information.

## Releasing a New Version

As you make updates to your package, refer to the semantic versioning while drafting new releases. When you create a new tag in the associated git repository, Packagist will automatically be updated.

## Semantic Versioning

This section will provide a short overview of how Semantic Versioning is used and applied by Composer. To get a more in-depth overview, check out [semver.org](https://semver.org/).

A version consists of three parts: `MAJOR.MINOR.PATCH`. Version `1.2.3` of a package could be referred to as a package on major version `1`, minor version `2`, patchlevel `3`.

- **Major**: contains breaking changes, compared to previous release. Consumers of our package need to make adjustments to their existing code integrating this package.

- **Minor**: contains added functionality (e.g. _new methods_) which do not break existing functionality. Consumers of our package do not need to make adjustments to their existing code integrating this package.

- **Patchlevel**: contains bug fixes, upgraded dependencies, etc. but does not contain new functionality. Consumers of our package do not need to make adjustments to their existing code integrating this package.

## Composer

PHP's package manager [Composer](https://getcomposer.org/) uses the `composer.json` file to identify which packages should be installed and additionally which **versions** of a package are **compatible** with the project it belongs to. It keeps track of the versions through the package's **tags** on the corresponding repository.

From the Composer documentation:

> Composer first asks the VCS to list all available tags, then creates an internal list of available versions based on these tags [...] When Composer has a complete list of available versions from your VCS, it then finds the highest version **that matches all version constraints** in your project (it's possible that other packages require more specific versions of the library than you do, so the version it chooses may not always be the highest available version) and it downloads a zip archive of that tag to unpack in the correct location in your vendor directory.

### Version Constraints

Composer supports various [version constraints](https://getcomposer.org/doc/articles/versions.md#writing-version-constraints), of which the ones using semantic versioning are the most used as most packages implement semantic versioning. There are two distinct ways to define a semantic version range:

- Semantic version range (tilde "~"): `~1.2`, translates to `>=1.2 <2.0.0`. All packages of version `1.x` are considered valid. A more specific range `~1.2.3` translates to `>=1.2.3 <1.3.0`. All packages of version `1.2.x` are considered valid.

- Strict semantic version range (caret "^"): `^1.2.3`, translates to `>=1.2.3 <2.0.0`. All packages of version `1.x` are considered valid (since no breaking changes should be introduced while upgrading minor versions) and is therefore closer following the semantic versioning system compared to the "tilde" method mentioned above.

Semantic versioning allows to specify a broad range of compatible libraries, preventing collisions with other dependencies requiring the same library and avoiding breaking changes at the same time.

Alternatively, Composer allows for more strict constraints:

- Exact version: `1.2.3`, will always download `1.2.3`. If other packages require a different version of this dependency, composer will throw an error since the requirements for this dependency can not be satisfied.

- Defined version range (hyphen "-"): `1.0 - 2.0`, translates to `>=1.0.0 <2.1`. All packages of version `1.x` are considered valid. A more specific range could be defined in the form `1.0.0 - 1.3.0`, which translates to `>=1.0.0 <=1.3.0`. All packages of version `1.2.x` will be considered valid.
