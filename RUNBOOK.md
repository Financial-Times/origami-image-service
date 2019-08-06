# Origami Image Service V2

The Origami Image Service can be used to optimise and resize images. You can crop, tint, and convert images in JPEG, PNG, GIF and SVG formats quickly and easily.

## Service Tier

Platinum

## Lifecycle Stage

Production

## Primary URL

https://www.ft.com/__origami/service/image/v2

## Host Platform

Heroku

## Contains Personal Data

no

## Contains Sensitive Data

no

## Delivered By

origami-team

## Supported By

origami-team

## Known About By

* jake.champion
* rowan.manning

## Dependencies

* ft-fastly
* content-api
* dyn-dns
* heroku

## Healthchecks

* origami-image-service-us.herokuapp.com-https
* origami-image-service-eu.herokuapp.com-https

## Failover Architecture Type

ActiveActive

## Failover Process Type

FullyAutomated

## Failback Process Type

FullyAutomated

## Data Recovery Process Type

NotApplicable

## Release Process Type

PartiallyAutomated

## Rollback Process Type

PartiallyAutomated

## Key Management Process Type

Manual

## Architecture Diagram

https://docs.google.com/drawings/d/1By1z0mwDG8QlOAvCgPLq23rn_K2NDyYQ7FLh-gH-X-8">https://docs.google.com/drawings/d/1By1z0mwDG8QlOAvCgPLq23rn_K2NDyYQ7FLh-gH-X-8

## Architecture

This is mostly a Node.js application which acts as a proxy between the end user and a third-party service named Cloudinary.

### Fetching an image

1. End user makes a request for an image
2. Our Fastly service responds with a cached image if it exists [end], or forwards the request to this service
3. Our service forwards the request to Cloudinary, converting our transformation config into a format that Cloudinary understands
4. Cloudinary responds with a cached image if it exists [end], or fetches the image from its origin
5. The origin service responds to Cloudinary with an image or 404


## More Information

https://github.com/Financial-Times/origami-image-service#readme

## First Line Troubleshooting

There are a few things you can try before contacting the Origami team:

1. Verify that Cloudinary is up ([status page](https://status.cloudinary.com/)). This being down won't break old images, but it will prevent new images from being requested.
2. Restart all of the dynos across the production EU and US Heroku apps ([pipeline here](https://dashboard.heroku.com/pipelines/748923ac-b3c0-4289-a0ac-c26b5a7dbe3a))

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1. Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2. Check the Heroku metrics page for both EU and US apps, to see what CPU and memory usage is like ([pipeline here](https://dashboard.heroku.com/pipelines/be91fac7-5b0e-40f5-abd1-b81b72ad1b97))
2. Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA.

## Monitoring

https://github.com/Financial-Times/origami-image-service#monitoring

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Data Recovery Details

No data-recovery required.

## Release Details

The application is deployed to QA whenever a new commit is pushed to the `master` branch of this repo on GitHub.

The application is deployed to production whenever a semver tag is added to this repo on Github, such as through GitHub's Releases interface.

## Key Management Details

This service uses an API key for Cloudinary. The process for rotating these keys is manual, via the Cloudinary interface.
