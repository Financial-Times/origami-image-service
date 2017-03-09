## Summary

Date: 28 Feb 2017 (~1738) to 01 Mar 2017 (~2054) (~75 hours)
Numbers based on https://status.cloudinary.com/

## What happened?

New images and new image transformations from the Origami Image Service were failing.
AWS S3 went offline in US-East region, CLoudinary's CDN, "fetch" API, and "image transformation" APIs went offline. Heroku's dashboard and API went into maintenance mode.

[Slack: ft-next-support conversation](https://financialtimes.slack.com/archives/ft-next-support/p1488304703557575)
[Cloudinary incident report](https://status.cloudinary.com/incidents/n1b1868fk0d6)

## How was it fixed

### 28 Feb 2017

1738: Cloudinary posted an incident report that they are experiencing an elevated error rate in their image transformations service.

[1758](https://financialtimes.slack.com/archives/ft-next-support/p1488304718558953): Jake Champion acknowledged that there is an issue with Cloudinary, which means some images will not be loading.

1808: Cloudinary updated incident report stating that they are preparing for mitigation using a different region in case the S3 outage becomes extended.

[1923](https://financialtimes.slack.com/archives/ft-tech-incidents/p1488309821116444): Service message went out which mentioned issues with images on the website.

[1932](https://financialtimes.slack.com/conversation/ft-tech-incidents/p1488310192148718): Cloudinary still haven't resolved the issue on their side.

~1940: Alice Bartlett, Rowan Beentje and Jake Champion decided that Cloudinary were taking too long to fix the issue on their end. A plan to migrate broken images to the old on-site Origami Image Service was agreed.

~1945: Rowan Beentje scales up the old Image Service servers to cope with the expected load once the redirection is in place.

[2012](https://github.com/Financial-Times/ft.com-cdn/pull/335): Changes made to the ft.com CDN (Fastly) service to force broken images to use the old image service were merged.

[2019](https://financialtimes.slack.com/archives/ft-tech-incidents/p1488313158397214): Changes to CDN were manually deployed to test and stage environments as Circle CI was having issues due to the same AWS outage.

[2027](https://financialtimes.slack.com/archives/ft-tech-incidents/p1488313657434355): Changes to CDN were manually deployed to production and looked to be working.

2030: Manual purging of broken images on homepage and main stories on ft.com by Jake Champion

[2046](https://financialtimes.slack.com/archives/ft-next-support/p1488314781416315): Ben Fletcher noticed the login/logout application is not working on ft.com

[2055](https://financialtimes.slack.com/archives/ft-next-support/p1488315313456663): Jake Champion rolled back the CDN changes as the deployment to production wasn't correct and included changes to the code that it shouldn't had.

[2058](https://financialtimes.slack.com/archives/ft-tech-incidents/p1488315513574278): Cloudinary started to come back online and images started working once again.


## Cause

AWS S3 went offline in the US-East region which triggered a series of issues for the external image optimising service we use (Cloudinary).


## What could be done to avoid this in future?

- Cloudinary going fully multi-region.
- Improving Fastly-tools to mitigate the issue where a deployment contains changes it shouldn't.
- Have a healthcheck on the Origami Image Service which fails when new transformations by Cloudinary are not working.
- Catch all errors from Cloudinary and ensure we do not cache them for a long period of time.
- Simplify the purging process for Origami Image Service.