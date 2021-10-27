'use strict';

const assert = require('proclaim');
const nock = require('nock');

describe('lib/middleware/get-headshot-url', () => {
	let origamiService;
	let getHeadshotUrl;
	let config;

	beforeEach(() => {
		origamiService = require('../../mock/origami-service.mock');

		config = {contentApiKey: 'test'};

		getHeadshotUrl = require('../../../../lib/middleware/get-headshot-url');
	});

	afterEach(() => {
		nock.cleanAll();
	});

	it('exports a function', () => {
		assert.isFunction(getHeadshotUrl);
	});

	describe('getHeadshotUrl(config)', () => {
		let middleware;

		beforeEach(() => {
			middleware = getHeadshotUrl(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			describe('when the request is not for an fthead scheme', () => {
				it('does not modify the imageUrl request parameter', (done) => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:example';
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						if (error) {
							done(error);
						} else {
							try {
								assert.strictEqual(origamiService.mockRequest.params.imageUrl, 'ftcms:example');
								done();
							} catch (error) {
								done(error);
							}
						}
					});
				});
				
				it('calls next with no arguments', (done) => {
					origamiService.mockRequest.params.imageUrl = 'ftcms:example';
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						if (error) {
							done(error);
						} else {
							done();
						}
					});
				});
			});

			describe('when the requested author name is an XSS payload', () => {
				const requestedAuthor = '<alert>boom pow</alert>';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
				});

				it('calls `next` with a 404 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, 'Refusing to get image for the provided name - The image name was an unexpected format. If this name should work, please contact someone from the Origami team.');
							assert.strictEqual(error.status, 404);
							assert.strictEqual(error.cacheMaxAge, '1d');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when the Concept Search API returns no results', () => {
				const requestedAuthor = 'origami-fox';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com', {'encodedQueryParams':true})
					.get('/concepts')
					.query({'type':'http%3A%2F%2Fwww.ft.com%2Fontology%2Fperson%2FPerson','mode':'search','q': requestedAuthor,'boost':'authors'}).reply(200, {
						'concepts': []
					}, {
						'Content-Type': 'application/json',
					});
				});

				it('calls `next` with a 404 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - No author found who matches that name.`);
							assert.strictEqual(error.status, 404);
							assert.strictEqual(error.cacheMaxAge, '1d');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when no author from Concept Search API matches the requested author', () => {
				const requestedAuthor = 'origami-fox';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com', {'encodedQueryParams':true})
					.get('/concepts')
					.query({'type':'http%3A%2F%2Fwww.ft.com%2Fontology%2Fperson%2FPerson','mode':'search','q': requestedAuthor,'boost':'authors'}).reply(200, {
						'concepts': [
							{
								'id': 'http://www.ft.com/thing/08c3aeaf-259b-436a-83d9-7253c78540fc',
								'apiUrl': 'http://api.ft.com/people/08c3aeaf-259b-436a-83d9-7253c78540fc',
								'prefLabel': 'Lionel Barber',
								'type': 'http://www.ft.com/ontology/person/Person',
								'scopeNote': 'British journalist'
							},
							{
								'id': 'http://www.ft.com/thing/26d1d601-54fe-3c6d-8fec-764a7b7c63da',
								'apiUrl': 'http://api.ft.com/people/26d1d601-54fe-3c6d-8fec-764a7b7c63da',
								'prefLabel': 'Lionel Richie',
								'type': 'http://www.ft.com/ontology/person/Person',
							}
						]
					}, {
						'Content-Type': 'application/json',
					});
				});

				it('calls `next` with a 404 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - No author found who matches that name.`);
							assert.strictEqual(error.status, 404);
							assert.strictEqual(error.cacheMaxAge, '1d');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when an author from Concept Search API matches the requested author', () => {

				describe('when People API responds with an empty _imageUrl', () => {
					const requestedAuthor = 'lionel-barber';
					beforeEach(() => {
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.reply(200, {
							'concepts': [
								{
									'apiUrl': 'https://api.ft.com/people/1',
									'prefLabel': 'Lionel Barber',
								},
								{
									'apiUrl': 'https://api.ft.com/people/2',
									'prefLabel': 'Lionel Richie',
								}
							]
						})
						.get('/people/1')
						.reply(200, {
						});
					});

					it('calls `next` with a 404 error', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							try {
								assert.isInstanceOf(error, Error);
								assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - The author has no headshot.`);
								assert.strictEqual(error.status, 404);
								assert.strictEqual(error.cacheMaxAge, '1d');
								done();
							} catch (error) {
								done(error);
							}
						});
					});
				});

				describe('when People API responds with a filled _imageUrl', () => {
					const requestedAuthor = 'lionel-barber';
					const _imageUrl = 'https://example.com/lionel-barber.png';
					beforeEach(() => {
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.reply(200, {
							'concepts': [
								{
									'apiUrl': 'https://api.ft.com/people/1',
									'prefLabel': 'Lionel Barber',
								},
								{
									'apiUrl': 'https://api.ft.com/people/2',
									'prefLabel': 'Lionel Richie',
								}
							]
						})
						.get('/people/1')
						.reply(200, {
							'_imageUrl': _imageUrl
						});
					});

					it('sets the `imageUrl` request parameter to the value of _imageUrl', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							if (error) {
								done(error);
							} else {
								try {
									assert.strictEqual(origamiService.mockRequest.params.imageUrl, _imageUrl);
									done();
								} catch (error) {
									done(error);
								}
							}
						});
					});
				});
			});

			describe('when Concept Search API responds with a 400', () => {
				const requestedAuthor = 'origami-fox';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(403);
				});

				it('calls `next` with a 404 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - The url "https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=origami-fox&boost=authors" responded with a 403 status code.`);
							assert.strictEqual(error.status, 404);
							assert.strictEqual(error.cacheMaxAge, '5m');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when Concept Search API responds with a 500', () => {
				const requestedAuthor = 'origami-fox';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(503);
				});

				it('calls `next` with a 500 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - The url "https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=origami-fox&boost=authors" responded with a 503 status code.`);
							assert.strictEqual(error.status, 500);
							assert.strictEqual(error.cacheMaxAge, '5m');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when People API responds with a 400', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.reply(403);
				});

				it('calls `next` with a 404 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - The url "https://api.ft.com/people/1" responded with a 403 status code.`);
							assert.strictEqual(error.status, 404);
							assert.strictEqual(error.cacheMaxAge, '5m');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			describe('when People API responds with a 500', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.reply(503);
				});

				it('calls `next` with a 500 error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, `Unable to get image for ${requestedAuthor} - The url "https://api.ft.com/people/1" responded with a 503 status code.`);
							assert.strictEqual(error.status, 500);
							assert.strictEqual(error.cacheMaxAge, '5m');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});

			context('when the Concept Search API request', () => {
				describe('errors', () => {
					const requestedAuthor = 'origami-fox';
					beforeEach(() => {
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.replyWithError(new Error('mock error'));
					});
	
					it('calls `next` with an error', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							try {
								assert.isInstanceOf(error, Error);
								assert.strictEqual(error.message, 'mock error');
								done();
							} catch (error) {
								done(error);
							}
						});
					});
	
				});
	
				describe('fails a DNS lookup', () => {
					const requestedAuthor = 'origami-fox';
					beforeEach(() => {
						const dnsError = new Error('mock error');
						dnsError.code = 'ENOTFOUND';
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.replyWithError(dnsError);
					});
	
					it('calls `next` with a descriptive error', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							try {
								assert.isInstanceOf(error, Error);
								assert.strictEqual(error.message, 'DNS lookup failed for "https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=origami-fox&boost=authors"');
								done();
							} catch (error) {
								done(error);
							}
						});
					});
	
				});
	
				describe('connection resets', () => {
					const requestedAuthor = 'origami-fox';
					beforeEach(() => {
						const resetError = new Error('mock error');
						resetError.code = 'ECONNRESET';
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.replyWithError(resetError);
					});
	
					it('calls `next` with a descriptive error', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							try {
								assert.isInstanceOf(error, Error);
								assert.strictEqual(error.message, 'Connection reset when requesting "https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=origami-fox&boost=authors"');
								done();
							} catch (error) {
								done(error);
							}
						});
					});
	
				});
	
				describe('times out', () => {
					const requestedAuthor = 'origami-fox';
					beforeEach(() => {
						const timeoutError = new Error('mock error');
						timeoutError.code = 'ETIMEDOUT';
						origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
						origamiService.mockRequest.query.source = 'mock-source';
						nock('https://api.ft.com')
						.get('/concepts')
						.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
						.replyWithError(timeoutError);
					});
	
					it('calls `next` with a descriptive error', (done) => {
						middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
							try {
								assert.isInstanceOf(error, Error);
								assert.strictEqual(error.message, 'Request timed out when requesting "https://api.ft.com/concepts?type=http://www.ft.com/ontology/person/Person&mode=search&q=origami-fox&boost=authors"');
								done();
							} catch (error) {
								done(error);
							}
						});
					});
				});
			});
		});

		context('when the People API request', () => {
			describe('errors', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.replyWithError(new Error('mock error'));
				});

				it('calls `next` with an error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, 'mock error');
							done();
						} catch (error) {
							done(error);
						}
					});
				});

			});

			describe('fails a DNS lookup', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					const dnsError = new Error('mock error');
					dnsError.code = 'ENOTFOUND';
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.replyWithError(dnsError);
				});

				it('calls `next` with a descriptive error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, 'DNS lookup failed for "https://api.ft.com/people/1"');
							done();
						} catch (error) {
							done(error);
						}
					});
				});

			});

			describe('connection resets', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					const resetError = new Error('mock error');
					resetError.code = 'ECONNRESET';
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.replyWithError(resetError);
				});

				it('calls `next` with a descriptive error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, 'Connection reset when requesting "https://api.ft.com/people/1"');
							done();
						} catch (error) {
							done(error);
						}
					});
				});

			});

			describe('times out', () => {
				const requestedAuthor = 'lionel-barber';
				beforeEach(() => {
					const timeoutError = new Error('mock error');
					timeoutError.code = 'ETIMEDOUT';
					origamiService.mockRequest.params.imageUrl = `fthead:${requestedAuthor}`;
					origamiService.mockRequest.query.source = 'mock-source';
					nock('https://api.ft.com')
					.get('/concepts')
					.query({'type':'http://www.ft.com/ontology/person/Person','mode':'search','q': requestedAuthor,'boost':'authors'})
					.reply(200, {
						'concepts': [
							{
								'apiUrl': 'https://api.ft.com/people/1',
								'prefLabel': 'Lionel Barber',
							},
							{
								'apiUrl': 'https://api.ft.com/people/2',
								'prefLabel': 'Lionel Richie',
							}
						]
					})
					.get('/people/1')
					.replyWithError(timeoutError);
				});

				it('calls `next` with a descriptive error', (done) => {
					middleware(origamiService.mockRequest, origamiService.mockResponse, function next(error) {
						try {
							assert.isInstanceOf(error, Error);
							assert.strictEqual(error.message, 'Request timed out when requesting "https://api.ft.com/people/1"');
							done();
						} catch (error) {
							done(error);
						}
					});
				});
			});
		});
	});
});
