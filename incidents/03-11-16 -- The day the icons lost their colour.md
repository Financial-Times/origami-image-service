## Summary

Date: ~Thur 3 Nov 2016 (~1727) to Thur 3 Nov 2016 (~1900) (~1.5 hours)


## What happened?

Tinting of icons failed to work, causing icons to be returned in their original colour, black.

[Slack: ft-next-dev conversation](https://financialtimes.slack.com/archives/ft-next-dev/p1478194076012206)


## How was it fixed

### Thur 3 Nov 2016

~1442: [Changes in `origami-image-service`](https://github.com/Financial-Times/origami-image-service/pull/138) were deployed which enabled custom scheme URIs to be cache-busted every week.

1727 : Laurie Boyes noticed that the `myFT` image had turned black and announced in `ft-next-dev`.

1727: Origami team ([Jake Champion](https://github.com/JakeChampion)) [contacted via Slack](https://financialtimes.slack.com/archives/ft-next-dev/p1478194076012206).

~1837: [Changes in `origami-image-service`](https://github.com/Financial-Times/origami-image-service/pull/139) were deployed by [Jake Champion](https://github.com/JakeChampion) that ensures query parameters can be added to an already existing query string.

~1900: All icon requests to the service which were made over a 72 hour perioud were purged from our cache.


## Cause

Changes made to `origami-image-service` which enabled custom schemes to be cache-busted, caused a regression in our tinting functionality.


## What could be done to avoid this in future?

- [Write tests](https://github.com/Financial-Times/origami-image-service/commit/bdcdd5f39a2c5c3e257e79e5fa9173dbbecaac83) to ensure that heavily used features such as tinting do not regress.
- Automated integration testing for important features before promoting to production.
