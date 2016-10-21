
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
  * [Monitoring](#monitoring)
  * [Trouble-Shooting](#trouble-shooting)
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

Now you can access the app over HTTP on port `3002`: [http://localhost:3002/](http://localhost:3002/)


Configuration
-------------

We configure Origami Image Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `LOG_LEVEL`: A Syslog-compatible level at which to emit log events to stdout. One of `trace`, `debug`, `info`, `warn`, `error`, or `crit`.
  * `PREFERRED_HOSTNAME`: The hostname to use in documentation and as a base URL in bundle requests. This defaults to `image.webservices.ft.com`.
  * `CLOUDINARY_ACCOUNT_NAME`: The name of the Cloudinary account to use in image transforms.
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

### Comparison page

The comparison page in the documentation (`/origami/service/image/v2/docs/compare`) is used to manually check images against their version 1 equivalent. This page is powered by [a JSON file](data/comparison-images.json) which is updated manually.

Once you've added a new comparison image to this file, you should run the following Make task to update the file sizes and formats:

```sh
make fetch-comparison-data
```

Then you should commit your changes.


Deployment
----------

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy the last QA image by running the following:

```sh
CR_API_KEY=<API-KEY> make promote
```


Monitoring
----------

  * [Grafana dashboard][grafana]: graph memory, load, and number of requests
  * [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
  * [Pingdom check (Production US)][pingdom-us]: checks that the US production app is responding
  * [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
  * [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
  * [Splunk dashboard (Production)][splunk]: query application logs


Trouble-Shooting
----------------

We've outlined some common issues that can occur in the running of the Image Service:

### What do I do if memory usage is high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-image-service-eu
heroku restart --app origami-image-service-us
```

If this doesn't help, then a temporary measure could be to add more dynos to the production applications, or switch the existing ones to higher performance dynos.

### What if I need to deploy manually?

If you _really_ need to deploy manually, you should only do so to QA. Production deploys should always be a promotion from QA.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy to QA using the following:

```sh
CR_API_KEY=<API-KEY> make deploy
```


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/origami-image-service
[grafana]: http://grafana.ft.com/dashboard/db/origami-image-service-v2
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production-eu]: https://dashboard.heroku.com/apps/origami-image-service-eu
[heroku-production-us]: https://dashboard.heroku.com/apps/origami-image-service-us
[heroku-qa]: https://dashboard.heroku.com/apps/origami-image-service-qa
[heroku]: https://heroku.com/
[image-service]: https://image.webservices.ft.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=2301115
[pingdom-us]: https://my.pingdom.com/newchecks/checks#check=2301117
[sentry-production]: https://sentry.io/nextftcom/origami-image-service-producti/
[sentry-qa]: https://sentry.io/nextftcom/origami-image-service-qa/
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/origamiimageservice
