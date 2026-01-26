# Developing Laravel Packages

This is the repo for the [Laravel Package](https://laravelpackage.com/) project. A central place to learn how to create a package from scratch.

All provided examples are available as an accompanying example package named "BlogPackage", which you can find and clone here: [https://github.com/Jhnbrn90/BlogPackage](https://github.com/Jhnbrn90/BlogPackage/).

## Contributing

Contributions are highly welcomed.

The documentation site is generated using **MkDocs**, so you’ll need either a local Python setup or Docker to get started.

### Option 1 - Local Python setup
To start contributing with a local Python setup, follow these steps:

1. Fork this repository and clone it locally
1. Create a new virtual environment:
    ```bash
    python3 -m venv venv
    ```
1. Activate the virtual environment:
    ```bash
    source venv/bin/activate
    ```
1. Install the requirements:
    ```bash
    pip install -r requirements.txt
    ```
1. Start the local development server:
    ```bash
    mkdocs serve
    ```
1. Open http://localhost:8000 in your browser to view the documentation site.

### Option 2 - Docker
If you prefer not to install Python and MkDocs locally, you can contribute using Docker:

1. Fork this repository and clone it locally
1. Ensure Docker is installed and running.
1. From the project root, run:
    ```bash
    docker run --rm -it -p 8000:8000 -v ${PWD}:/docs squidfunk/mkdocs-material
    ```
1. Open http://localhost:8000 in your browser to view the documentation site.


When satisfied, commit your changes and submit the PR to the master branch

## Credits

- [John Braun][link-author]
- [All Contributors][link-contributors]

[link-author]: https://github.com/Jhnbrn90
[link-contributors]: ../../contributors
