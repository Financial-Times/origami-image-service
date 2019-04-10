'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('../helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('../helpers/it-responds-with-status');
const setupRequest = require('../helpers/setup-request');

const flagImages = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/origami-flag-images'), 1);
const ftIcons = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/fticons'), 1);
const logoImages = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/logo-images'), 1);
const brandImages = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/origami-brand-images'), 1);
const specialistTitleLogos = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/origami-specialist-title-logos'), 1);
const podcastLogos = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/podcast-logos'), 1);
const socialImages = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/social-images'), 1);
const headshotImages = mapImagesetToSchemeNameAndUrlPairs(require('@financial-times/headshot-images'), 1);

function mapImagesetToSchemeNameAndUrlPairs(imageset, version) {
    return imageset.images.reduce(function (accumulator, currentValue) {
        if (version) {
            accumulator[`${imageset.scheme}-v${version}:${currentValue.name}`] = currentValue.url;
        } else {
            accumulator[`${imageset.scheme}:${currentValue.name}`] = currentValue.url;
        }
        return accumulator;
    }, Object.create(null));
}

describe('Origami Image Sets via Custom Schemes', function () {
    describe('origami-flag-images', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(flagImages)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('fticons', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(ftIcons)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('logo-images', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(logoImages)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('origami-brand-images', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(brandImages)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('origami-specialist-title-logos', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(specialistTitleLogos)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('podcast-logos', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(podcastLogos)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('social-images', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(socialImages)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });
    describe('headshot-images', function () {
        for (const [customSchemeUrl, realUrl] of Object.entries(headshotImages)) {
            describe(customSchemeUrl, function () {
                setupRequest('GET', `/v2/images/debug/${customSchemeUrl}?source=test`);
                itRespondsWithStatus(200);
                itRespondsWithContentType('application/json');
                
                it(`${customSchemeUrl} is transformed into ${realUrl}`, function (done) {
                    this.request.expect(response => {
                        assert.match(response.body.transform.uri, new RegExp(realUrl));
                    }).end(done);
                });
            });
        }
    });

});