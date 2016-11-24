## Summary

Date: ~Fri 11 Nov 2016 (~1324) to Fri 11 Nov 2016 (~1452) (~1.5 hours)


## What happened?

Images that had particularly long urls would fail to load.

[Slack: ft-next-support conversation](https://financialtimes.slack.com/archives/ft-next-support/p1478697892005272)


## How was it fixed

### Thur 3 Nov 2016

~1215: [Changes in `next-article`](https://github.com/Financial-Times/next-article/pull/1665) were deployed which swapped all images in articles from the old image service to the new image service.

1324 : Mustafa Sogancilar noticed that the market images were missing from the site and announced in `ft-next-support`.

1332: Origami team ([Jake Champion](https://github.com/JakeChampion)) [contacted via Slack](https://financialtimes.slack.com/archives/ft-next-support/p1478698330005277).

~1337: [Jake Champion](https://github.com/JakeChampion) reverts [changes in `next-article`](https://github.com/Financial-Times/next-article/commit/a45a109116bd817b584648558e26bf3c03a5885d) so it no longer uses the (broken) v2 image service.

1413: [Changes in `next-article`](https://github.com/Financial-Times/next-article/pull/1666) were merged.

1416: [Changes in `n-content-transform`](https://github.com/Financial-Times/n-content-transform/pull/28) were merged.

~1452: Changes went live and issue was confirmed as being resolved.


## Cause

Changes made to `n-content-transform` and `next-article` to use the new image service surfaced a bug in our new image service which fails to load images from urls longer than 256 characters.


## What could be done to avoid this in future?

- [Document the current breaking feature and place it in our migration guide.](https://github.com/Financial-Times/origami-image-service/issues/153)
- [Write integration test which makes request for images at varying url lengths.](https://github.com/Financial-Times/origami-image-service/issues/158)
