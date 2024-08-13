# Origami Image Service

Optimises and resize images. See [the production service][production-url] for API information.

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]

## Table Of Contents

- [Requirements](#requirements)
- [Running Locally](#running-locally)
- [Configuration](#configuration)
- [Adding Images](#adding-images)
- [Testing](#testing)
- [Deployment](#deployment)
- [Scheduled Tasks](#scheduled-tasks)
- [Monitoring](#monitoring)
- [Trouble-Shooting](#trouble-shooting)
- [License](#license)

## Requirements

Running Origami Image Service requires [Node.js], [npm] and [git-lfs](https://git-lfs.github.com/).

## Running Locally

Before we can run the application, we'll need to install dependencies:

```sh
npm install
```

You will also need to have redis server running locally. You can download and run redis server using brew:

```sh
brew install redis
redis-server
```

This will start a redis server on port 6379 which is the default port for redis. And our application will be able to connect to it automatically without specifying any configuration.

After spinning up Redis server run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)

## Configuration

We configure Origami Image Service using environment variables. In local development, configurations are set in a `.env` file. In production, these are set through Doppler project that will sync secrets to Heroku as well

### Add secrets locally

Origami stores their secrets on Doppler to get them on your local development environment you will need to install the [Doppler CLI](https://docs.doppler.com/docs/install-cli), login in Doppler and run the following command to setup Doppler within the repo:

```sh
doppler setup
```

Setup will ask you to select the project you want to use, select origami-image-service-v2 and then select the local environment. Once setup is complete you can download the secrets to your local environment by running:

```sh
doppler secrets download --no-file --format env-no-quotes > .env
```

**NOTE:** You might need to request contributor access to the Doppler project from the Origami team.

### Required everywhere

- `CONTENT_API_KEY`: The API key for the FT UPP Content API.
- `CLOUDINARY_ACCOUNT_NAME`: The name of the Cloudinary account to use in image transforms.
- `CLOUDINARY_API_KEY`: The Cloudinary API key corresponding to `CLOUDINARY_ACCOUNT_NAME`.
- `CLOUDINARY_API_SECRET`: The Cloudinary API secret corresponding to `CLOUDINARY_ACCOUNT_NAME`.
- `CUSTOM_SCHEME_STORE`: The location of the images used in custom schemes. This should be set to the base path under which images live.
- `CUSTOM_SCHEME_CACHE_BUST`: A key used to manually cache-bust custom scheme images.
- `HOSTNAME`: The hostname to use for tinting SVGs. This defaults to the hostname given in the request. [See the trouble-shooting guide for more information](#svgs-dont-tint-locally).
- `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
- `PORT`: The port to run the application on.

### Required in Heroku

- `FASTLY_PURGE_API_KEY`: A Fastly API key which is used to purge URLs (when somebody POSTs to the `/purge` endpoint)
- `GRAPHITE_API_KEY`: The FT's internal Graphite API key
- `PURGE_API_KEY`: The API key to require when somebody POSTs to the `/purge` endpoint. This should be a non-memorable string, for example a UUID
- `REGION`: The region the application is running in. One of `QA`, `EU`, or `US`
- `RELEASE_LOG_ENVIRONMENT`: The Salesforce environment to include in release logs. One of `Test` or `Production`
- `SENTRY_DSN`: The Sentry URL to send error information to

Open [Telemetry API configuration](https://tech.in.ft.com/tech-topics/observability/opentelemetry/heroku):

- `OTEL_EXPORTER_OTLP_API_KEY`
- `OTEL_EXPORTER_OTLP_COMPRESSION`
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`
- `OTEL_NODE_RESOURCE_DETECTORS`
- `OTEL_SERVICE_NAME`

**TODO:** The options below are required at the moment, but are duplicates of other options above. This will be addressed once all services are using Origami Makefile.

- `FASTLY_API_KEY`: The Fastly API key to use when purging assets. If not set, purge endpoints are not registered. This should be the same value as `FASTLY_PURGE_API_KEY`
- `FASTLY_SERVICE_ID`: The Fastly service to purge assets from
- `API_KEY`: The API key to use when purging assets. If not set, endpoints which require an API key are not registered. This should be the same value as `PURGE_API_KEY`

### Required locally

- `GRAFANA_API_KEY`: The API key to use when using Grafana push/pull

### Headers

The service can also be configured by sending HTTP headers, these would normally be set in your CDN config:

- `FT-Origami-Service-Base-Path`: The base path for the service, this gets prepended to all paths in the HTML and ensures that redirects work when the CDN rewrites URLs.
- `FT-Origami-Api-Key`: The API key for the service, this is used when calling API endpoints which are restricted to FT Origami developers.

## Adding Images

The Origami Image Service fetches and transforms images from external hosts, such as FT APIs or any given URL. It also hosts [a number of image sets](https://www.ft.com/__origami/service/image/v2/docs/image-sets) directly.

To add, edit, or remove an image in one of these image sets see the `image-sets` directory. Some image sets have their own `readme.md` or `contribution.md` with further guidance specific to the image set. For example see the [fticon contributing guide](./image-sets/fticon/v1/contributing.md).

Removing an image from an image set is considered a major change. To remove an image a new major version of the Origami Image Service API must be released. Therefore it's typical to deprecate images first, and remove multiple deprecated images later as a batch. To manage this each image set directory has a `deprecated.json` file containing a list of images in the set which are deprecated and should be removed in the next major version of the Origami Image Service. Deprecated images are hidden on the Origami Image Service image sets page.

## Testing

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

We run the tests and linter on CI, you can view [results on CI][ci]. `make test` and `make lint` must pass before we merge a pull request.

You can run the integration tests against a URL by setting a `HOST` environment variable to the URL you want to test. This is useful for testing a Heroku application after it is deployed, which we do on CI.

```sh
HOST="https://www.example.com" make test-integration
```

## Deployment

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You can promote either through the Heroku interface, or by running the following command locally:

```sh
make promote
```

Alternatively you can use labels on pull requests to promote to production. If you add the label `release:major`, `release:minor` or `release:patch` to a pull request, it will be promoted to production when it is merged. This is useful for small changes, or if you don't have access to the Heroku pipeline. But if changes are large, or you want to test them on QA first, you should merge PR without a label and test on QA.

Creating release manually from github will also promote to production.

## Dependency management (Dependabot)

This repository uses Dependabot for automated dependency management. Dependabot regularly checks for outdated dependencies in the project and automatically creates pull requests to update them. This helps ensure that the project stays up-to-date with the latest versions, improving security and functionality.

By leveraging Dependabot, we can:

- Automatically receive notifications for new versions of dependencies.
- Keep our dependencies secure and up-to-date.
- Reduce the manual effort required to manage dependency updates.

How to manage open Dependabot PRs?

- Most of the time the PRs that Dependabot raises will be automerged if it meets all the status checks, if there are open PRs they require more investigation. Also, if there are multiple PRs raised by Dependabot at once, there will be multiple requests for PRs to be deployed on `origami-image-service-dev` Heroku app.

1. Identify a PR you want to tackle and re-run the status checks. If they all pass it will be automatically merged and deployed to [QA][heroku-qa] app

   - If this fails on one of the status checks: Review the changes proposed by Dependabot to ensure they are compatible with the project. This involves checking out the branch and running locally and fixing where appropiate.

2. Review the [QA][heroku-qa] app to check the app is running normally
3. Promote to production

## Scheduled Tasks

The Origami Image Service uses a Heroku Schedule to run `scripts/delete-old-images-from-cloudinary.js` daily. This is setup only for the `origami-image-service-eu` app. It removes transformations for past images, reducing the number of images we store via Cloudinary.

## Monitoring

- [Grafana dashboard][grafana]: graph memory, load, and number of requests
- [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
- [Pingdom check (Production US)][pingdom-us]: checks that the US production app is responding
- [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
- [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
- [Splunk dashboard (Production)][splunk]: query application logs

## Trouble-Shooting

We've outlined some common issues that can occur in the running of the Image Service:

### My Integration Tests are failing or running too long

We implemented redis caching to track image hostnames, but Heroku will change database URLs from time to time and you might need to update `REDIS_URL` in doppler in `CI` config to run integration tests successfully.

### Requesting a PNG but being returned a JPG, why is that?

When a png image is requested, and the requested image has no alpha channel (no transparency in the image), a jpg is instead returned because it will have a smaller filesize.

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

### How do I reduce Cloudinary storage use?

Cloudinary stores images and their transformations (format, size, etc.). This is not always necessary as:

1. Our CDN caches images, for up to a year depending on its origin.
1. Images are less likely to be viewed after a period of time. Some images are replaced, and won't be accessed again.
1. The image size apps request and the formats browsers support change – serving jpg is less common now.

To combat ever increasing storage requirements, a [scheduled task](#scheduled-tasks) periodically deletes stored transformations. If Cloudinary storage climbs high, ensure this script is working as expected. Alternatively, consider deleting all transforms for un-accessed assets using [Cloudinary's bulk deletion tool](https://cloudinary.com/documentation/admin_api#resources_last_access_reports).

### SVGs don't work when running locally

When an SVG image is requested we rewrite the URL to go route back through the Image Service, this is to sanatize the SVG of any cross-site-scripting attack vectors and to tint the SVG if tinting has been requested. It looks something like this:

- User requests:<br/>
  `http://imageservice/v2/images/raw/http://mysite/example.svg?tint=red`
- Image service rewrites to:<br/>
  `http://imageservice/v2/images/raw/http://imageservice/images/svgtint/http://mysite/example.svg%3Fcolor=red`
- Cloudinary receives the image URL:<br/>
  `http://imageservice/images/svgtint/http://mysite/example.svg?color=red`

When you're running locally this won't work because Cloudinary cannot access your `localhost`. The flow would look like this:

- User requests:<br/>
  `http://localhost/v2/images/raw/http://mysite/example.svg?tint=red`
- Image service rewrites to:<br/>
  `http://localhost/v2/images/raw/http://localhost/images/svgtint/http://mysite/example.svg%3Fcolor=red`
- Cloudinary receives the image URL:<br/>
  `http://localhost/images/svgtint/http://mysite/example.svg?color=red`

So Cloudinary responds with a `404`, and you may see an error like `connect ECONNREFUSED 127.0.0.1:443`. You can get around this by manually specifying a hostname in your configuration. You'll need to tell the service to rely on the QA instance for SVG tinting. Add the following to your `.env` file:

```
HOSTNAME=origami-image-service-qa.herokuapp.com
```

## License

The Financial Times has published this software under the [MIT license][license].

[grafana]: https://grafana.ft.com/dashboard/db/origami-image-service
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production-eu]: https://dashboard.heroku.com/apps/origami-image-service-eu
[heroku-production-us]: https://dashboard.heroku.com/apps/origami-image-service-us
[heroku-qa]: https://dashboard.heroku.com/apps/origami-image-service-qa
[heroku]: https://heroku.com/
[license]: https://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=2301115
[pingdom-us]: https://my.pingdom.com/newchecks/checks#check=2301117
[production-url]: https://www.ft.com/__origami/service/image/v2
[sentry-production]: https://sentry.io/nextftcom/origami-image-service-producti/
[sentry-qa]: https://sentry.io/nextftcom/origami-image-service-qa/
[service-options]: https://github.com/Financial-Times/origami-service#options
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/origamiimageservice
