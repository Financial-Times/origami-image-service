## Summary

Date: ~Tues 22 Nov 2016 (~1015) to Thurs 24 Nov 2016 (~1300) (~50.75 hours)


## What happened?

Certain images were being served as JPEG XR to Firefox and Safari, which don't support this format.

[Slack: ft-next-support conversation](https://financialtimes.slack.com/archives/ft-next-support/p1479809738005819)


## How was it fixed

### Tues 22 Nov 2016

1015: Raj Zuha noticed a broken image in an article on the front page and posted in `ft-next-support`.

1022: Rowan Beentje alerted Origami (Rowan Manning and Jake Champion).

1026: Rowan Manning and Jake Champion started investigating the issue.

[continued reports of broken images throughout the day]

~1230: Rowan Manning deployed a [change to the Image Service](https://github.com/Financial-Times/origami-image-service/pull/162) fixing part of the issue.

~1500: Jake Champion deployed a [change to the Image Service VCL](https://github.com/Financial-Times/ft.com-cdn/releases/tag/prod-v91), finalising the first fix.

~1515: Jake Champion started purging images for the last week.

### Weds 23 Nov 2016

1045: Raj Zuha reported further broken images in `ft-next-support`.

1058: Raj Zuha contacted Jake Champion, after checking that the issue was the same as the previous day.

1115: Rowan Manning and Jake Champion investigate again and verify that the fix from the previous day did not work.

1148: Rowan Manning posted [a brief explanation of the issue](https://financialtimes.slack.com/archives/ft-next-support/p1479901717005985).

~1700: Rowan Manning deployed a [change to the Image Service](https://github.com/Financial-Times/origami-image-service/pull/169) fixing a second issue, due to a misunderstanding of how Cloudinary's JPEG XR logic works.

~1705: Jake Champion started purging images for the last week again.

### Thurs 24 Nov 2016

0916: Raj Zuha asked again in `ft-next-support` whether the fix had been applied. He reported still seeing broken images.

~1100: Rowan Manning added some logging and alerting to the Image Service so that we know immediately if a new image breaks in this way.

~1215: Rowan Manning and Jake Champion spotted an issue in the way the Fastly purges were being performed and started running another purge for the last 24 hours.

1349: Raj Zuha confirms that the majority of images are now fixed.

~1410: Jake Champion performs a full purge of the last 10 days.


## Cause

A mismatch in Vary logic between Cloudinary and our application meant that any image that was loaded in Internet Explorer _before_ Firefox or Chrome would be cached as a JPEG XR.


## What could be done to avoid this in future?

- [Write integration test which ensure that Cloudinary returns the correct image format based on the Accept header.](https://github.com/Financial-Times/origami-image-service/issues/173)
