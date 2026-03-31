---
title: "Boost Skills"
description: "Learn how to ship Laravel Boost skills with your third-party package so users can install package-specific AI guidance automatically."
tags: ["Laravel Boost", "AI", "Skills", "Laravel Packages"]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2026-03-31
---

# Boost Skills

If your package integrates with Laravel Boost, you can include package-specific skills directly inside your package. These skills help AI tools understand your package structure, conventions, and recommended workflows.

When users install your package and run `php artisan boost:install`, Boost can automatically detect and install the skills you provide based on user preference.

## Why this matters

Third-party package skills allow AI tools to generate code that is aligned with your package instead of relying only on generic Laravel knowledge.

This is especially useful when your package introduces:

- custom conventions
- dedicated installation steps
- generated classes or file structure
- package-specific commands
- opinionated workflows
- recommended best practices

By shipping skills with the package, maintainers can guide AI tools toward the correct implementation patterns for their package.

## Skill location

Boost looks for skills inside the following directory in your package:

```text
resources/
└── boost/
    └── skills/
        └── {skill-name}/
            └── SKILL.md
```
## Skill format

Boost skills use the [Agent Skills format](https://agentskills.io/what-are-skills).

Each SKILL.md file must contain:

YAML frontmatter
a required name
a required description
concise Markdown instructions explaining when and how the skill should be used

A skill may also include supporting scripts, templates, or reference materials when they improve output quality.

## Example skill

Below is a minimal example of a valid skill file:

```md
---
name: package-installation
description: >-
  Guides AI agents when installing and configuring the package, including
  setup steps, publishing configuration, and common usage patterns.
---

# Package Installation

## When to apply

Use this skill when:

- installing the package
- configuring the package for first use
- publishing config or assets
- generating example integration code

## Instructions

- Install the package with Composer.
- Run the package install command if one exists.
- Publish configuration only when customization is needed.
- Follow the package defaults unless the user requests otherwise.
- Prefer documented public APIs over internal implementation details.

## Example

```bash
composer require vendor/package-name
php artisan vendor-package:install

```


## Writing effective skills

A good skill should be short, practical, and opinionated enough to help AI generate correct code.

Focus on:

- when the skill should apply
- the expected file structure
- key conventions the package requires
- the preferred setup or usage flow
- short example commands or code snippets

Avoid long explanations or broad theory. Skills work best when they are direct and actionable.

## Recommended approach

When creating skills for a package, it is often better to split them by responsibility instead of placing everything into one large skill.

Common examples include:

- installation
- configuration
- testing
- feature usage
- extension points
- troubleshooting

Smaller skills are usually easier for AI tools to apply correctly.

## Best practices

When shipping Boost skills with a package:

- keep instructions aligned with the current public API
- document conventions explicitly
- include real examples
- avoid ambiguous guidance
- update skills whenever package behavior changes

If your package has strict architecture, naming, or usage patterns, document them clearly so generated code remains consistent with your package design.

## How users install them

Once the package is installed, users can run:

```bash
php artisan boost:install
```
