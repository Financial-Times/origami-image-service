
Origami Image Service
=====================

Optimises and resize images. See [the production service][production-url] for API information.

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

Running Origami Image Service requires [Node.js] and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
npm install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure Origami Image Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config. Further documentation on the available options can be found in the [Origami Service documentation][service-options].

### Required everywhere

  * `CLOUDINARY_ACCOUNT_NAME`: The name of the Cloudinary account to use in image transforms.
  * `CLOUDINARY_API_KEY`: The Cloudinary API key corresponding to `CLOUDINARY_ACCOUNT_NAME`.
  * `CLOUDINARY_API_SECRET`: The Cloudinary API secret corresponding to `CLOUDINARY_ACCOUNT_NAME`.
  * `CUSTOM_SCHEME_STORE`: The location of the images used in custom schemes. This should be set to the base path under which images live.
  * `CUSTOM_SCHEME_CACHE_BUST`: A key used to manually cache-bust custom scheme images.
  * `HOSTNAME`: The hostname to use for tinting SVGs. This defaults to the hostname given in the request. [See the trouble-shooting guide for more information](#svgs-dont-tint-locally).
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `PORT`: The port to run the application on.

### Required in Heroku

  * `CMDB_API_KEY`: The API key to use when performing CMDB operations
  * `FASTLY_PURGE_API_KEY`: A Fastly API key which is used to purge URLs (when somebody POSTs to the `/purge` endpoint)
  * `GRAPHITE_API_KEY`: The FT's internal Graphite API key
  * `PURGE_API_KEY`: The API key to require when somebody POSTs to the `/purge` endpoint. This should be a non-memorable string, for example a UUID
  * `REGION`: The region the application is running in. One of `QA`, `EU`, or `US`
  * `RELEASE_LOG_API_KEY`: The change request API key to use when creating and closing release logs
  * `RELEASE_LOG_ENVIRONMENT`: The Salesforce environment to include in release logs. One of `Test` or `Production`
  * `SENTRY_DSN`: The Sentry URL to send error information to

**TODO:** The options below are required at the moment, but are duplicates of other options above. This will be addressed once all services are using Origami Makefile.

  * `FASTLY_API_KEY`: The Fastly API key to use when purging assets. If not set, purge endpoints are not registered. This should be the same value as `FASTLY_PURGE_API_KEY`
  * `FASTLY_SERVICE_ID`: The Fastly service to purge assets from
  * `API_KEY`: The API key to use when purging assets. If not set, endpoints which require an API key are not registered. This should be the same value as `PURGE_API_KEY`

### Required locally

  * `GRAFANA_API_KEY`: The API key to use when using Grafana push/pull

### Headers

The service can also be configured by sending HTTP headers, these would normally be set in your CDN config:

  * `FT-Origami-Service-Base-Path`: The base path for the service, this gets prepended to all paths in the HTML and ensures that redirects work when the CDN rewrites URLs.
  * `FT-Origami-Api-Key`: The API key for the service, this is used when calling API endpoints which are restricted to FT Origami developers.


Testing
-------

The tests are split into unit tests and integration tests. To run tests on your machine you'll need to install [Node.js] and run `npm install`. Then you can run the following commands:

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

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You can promote either through the Heroku interface, or by running the following command locally:

```sh
make promote
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

### I need to purge an image

Please read the [purging documentation](https://www.ft.com/__origami/service/image/v2/docs/purge) on the website.

### I need to purge all images, is this possible?
Please contact origami.support@ft.com - There is a way to purge all images, but this will incur a large cost.

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
make deploy
```

### SVGs don't tint locally

SVG tinting is done in a way that makes it near-impossible to run locally. When an SVG image is requested and a `tint` query parameter is provided, then we rewrite the URL to go route back through the Image Service. It looks something like this:

  * User requests:<br/>
  `http://imageservice/v2/images/raw/http://mysite/example.svg?tint=red`
  * Image service rewrites to:<br/>
  `http://imageservice/v2/images/raw/http://imageservice/images/svgtint/http://mysite/example.svg%3Fcolor=red`
  * Cloudinary receives the image URL:<br/>
  `http://imageservice/images/svgtint/http://mysite/example.svg?color=red`

When you're running locally this won't work because Cloudinary cannot access your `localhost`. The flow would look like this:

  * User requests:<br/>
  `http://localhost/v2/images/raw/http://mysite/example.svg?tint=red`
  * Image service rewrites to:<br/>
  `http://localhost/v2/images/raw/http://localhost/images/svgtint/http://mysite/example.svg%3Fcolor=red`
  * Cloudinary receives the image URL:<br/>
  `http://localhost/images/svgtint/http://mysite/example.svg?color=red`

So Cloudinary responds with a `404`. You can get around this by manually specifying a hostname in your configuration. You'll need to tell the service to rely on the QA instance for SVG tinting. Add the following to your `.env` file:

```
HOSTNAME=origami-image-service-qa.herokuapp.com
```


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/origami-image-service
[grafana]: http://grafana.ft.com/dashboard/db/origami-image-service
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production-eu]: https://dashboard.heroku.com/apps/origami-image-service-eu
[heroku-production-us]: https://dashboard.heroku.com/apps/origami-image-service-us
[heroku-qa]: https://dashboard.heroku.com/apps/origami-image-service-qa
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=2301115
[pingdom-us]: https://my.pingdom.com/newchecks/checks#check=2301117
[production-url]: https://www.ft.com/__origami/service/image/v2
[sentry-production]: https://sentry.io/nextftcom/origami-image-service-producti/
[sentry-qa]: https://sentry.io/nextftcom/origami-image-service-qa/
[service-options]: https://github.com/Financial-Times/origami-service#options
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/origamiimageservice
