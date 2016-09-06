
Origami Image Service
=====================

Optimises and resize images. See [the production service][image-service] for API information.

**:warning: Note: this is a work in progress version of a proxy-based image service. It's not ready for production use, and we may not go in this direction anyway. Consider this prototypal.**

[![Build status](https://img.shields.io/circleci/project/Financial-Times/origami-image-service.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Running Locally](#running-locally)
  * [Configuration](#configuration)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * Monitoring [TODO]
  * Trouble-Shooting [TODO]
  * [License](#license)


Requirements
------------

Running Origami Image Service requires [Node.js] 6.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
make install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure Origami Image Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `LOG_LEVEL`: A Syslog-compatible level at which to emit log events to stdout. One of `trace`, `debug`, `info`, `warn`, `error`, or `crit`.
  * `PREFERRED_HOSTNAME`: The hostname to use in documentation and as a base URL in bundle requests. This defaults to `image.webservices.ft.com`.
  * `CLOUDINARY_ACCOUNT_NAME`: The name of the Cloudinary account to use in image transforms.
  * `IMGIX_SECURE_URL_TOKEN`: The Imgix secure URL token to use in image transforms.
  * `IMGIX_SOURCE_NAME`: The Imgix source name to use in image transforms.
  * `RAVEN_URL`: The Sentry URL to send error information to.


Testing
-------

The tests are split into unit tests and integration tests. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
make test-integration  # run the integration tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

The [production][heroku-production] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You'll need to provide your GitHub username for change request logging, ensure you've been [added to this spreadsheet][developer-spreadsheet]. Now deploy the last QA image by running the following:

```sh
GITHUB_USERNAME=yourgithubusername make promote
```

We use [Semantic Versioning][semver] to tag releases. Only tagged releases should hit production, this ensures that the `__about` endpoint is informative. To tag a new release, use one of the following (this is the only time we allow a commit directly to `master`):

```sh
npm version major
npm version minor
npm version patch
```

Now you can push to GitHub (`git push && git push --tags`) which will trigger a QA deployment. Once QA has deployed with the newly tagged version, you can promote it to production.


License
-------

The Financial Times has published this software under the [MIT license][license].



[image-service]: https://image.webservices.ft.com/
[ci]: https://circleci.com/gh/Financial-Times/origami-image-service
[developer-spreadsheet]: https://docs.google.com/spreadsheets/d/1mbJQYJOgXAH2KfgKUM1Vgxq8FUIrahumb39wzsgStu0/edit#gid=0
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production]: https://dashboard.heroku.com/apps/origami-image-service
[heroku-qa]: https://dashboard.heroku.com/apps/origami-image-service-qa
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[semver]: http://semver.org/
