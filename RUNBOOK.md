<!--
    Written in the format prescribed by https://github.com/Financial-Times/runbook.md.
    Any future edits should abide by this format.
-->
# Origami Image Service V2

The Origami Image Service can be used to optimise and resize images. You can crop, tint, and convert images in JPEG, PNG, GIF and SVG formats quickly and easily.

## Code

origami-image-service-v2

## Service Tier

Platinum

## Lifecycle Stage

Production

## Primary URL

https://www.ft.com/__origami/service/image/v2

## Host Platform

Heroku

## Contains Personal Data

No

## Contains Sensitive Data

No

## Can Download Personal Data

No

## Can Contact Individuals

No

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

## Architecture

This is mostly a Node.js application which acts as a proxy between the end user and a third-party service named Cloudinary.

### Fetching an image

1.  End user makes a request for an image
2.  Our Fastly service responds with a cached image if it exists [end], or forwards the request to this service
3.  Our service forwards the request to Cloudinary, converting our transformation config into a format that Cloudinary understands
4.  Cloudinary responds with a cached image if it exists [end], or fetches the image from its origin
5.  The origin service responds to Cloudinary with an image or 404

## More Information

<https://github.com/Financial-Times/origami-image-service#readme>

## First Line Troubleshooting

There are a few things you can try before contacting the Origami team:

1.  Verify that Cloudinary is up ([status page](https://status.cloudinary.com/)). This being down won't break old images, but it will prevent new images from being requested.
2.  Restart all of the dynos across the production EU and US Heroku apps ([pipeline here](https://dashboard.heroku.com/pipelines/be91fac7-5b0e-40f5-abd1-b81b72ad1b97))

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1.  Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2.  Check the Heroku metrics page for both EU and US apps, to see what CPU and memory usage is like ([pipeline here](https://dashboard.heroku.com/pipelines/be91fac7-5b0e-40f5-abd1-b81b72ad1b97))
3.  Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA.

## Monitoring

<https://github.com/Financial-Times/origami-image-service#monitoring>

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Data Recovery Details

No data-recovery required.

## Release Details

The application is deployed to QA whenever a new commit is pushed to the `master` branch of this repo on GitHub.

The application is deployed to production whenever a semver tag is added to this repo on Github, such as through GitHub's Releases interface.

## Key Management Details

This service uses an API key for Cloudinary. The process for rotating these keys is manual, via the Cloudinary interface.

<!-- Placeholder - remove HTML comment markers to activate
## Heroku Pipeline Name
Enter descriptive text satisfying the following:
This is the name of the Heroku pipeline for this system. If you don't have a pipeline, this is the name of the app in Heroku. A pipeline is a group of Heroku apps that share the same codebase where each app in a pipeline represents the different stages in a continuous delivery workflow, i.e. staging, production.

...or delete this placeholder if not applicable to this system
-->