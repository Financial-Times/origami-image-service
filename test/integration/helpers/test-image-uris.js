'use strict';

const customSchemeStore = `${(process.env.CUSTOM_SCHEME_STORE || process.env.HOST || 'https://origami-image-service-dev.herokuapp.com')}/__origami/service/image/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`;

const httpCustomSchemeStore = new URL(customSchemeStore);
httpCustomSchemeStore.protocol = 'http';

const httpsCustomSchemeStore = new URL(customSchemeStore);
httpsCustomSchemeStore.protocol = 'https';

module.exports = {
	'app-badge': 'app-badge:apple',
	ftbrand: 'ftbrand-v1:brand-ft-money',
	fthead: 'fthead-v1%3A%C3%A6ndra-rininsland',
	ftcms: 'ftcms:6c5a2f8c-18ca-4afa-80ff-7d56e41172b1',
	ftflag: 'ftflag:jp',
	fticon: 'fticon:cross',
	ftlogo: 'ftlogo:brand-ft',
	ftsocial: 'ftsocial:whatsapp',
	specialisttitle: 'specialisttitle:ned-logo',
	capiv1: 'ftcms:be875529-7675-43d8-b461-b304410398c2',
	capiv2: 'ftcms:03b59122-a148-11e9-a282-2df48f366f7d',
	spark: 'ftcms:c3fec7fb-aba9-42ee-a745-a62c872850d0',
	sparkMasterImage: 'ftcms:817dd37c-b808-4b32-9db2-d50bdd92372b',
	httpsspark: 'https://d1e00ek4ebabms.cloudfront.net/production/817dd37c-b808-4b32-9db2-d50bdd92372b.jpg',
	httpftcms: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcms: 'https://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpftcmsmalformed: 'http:/im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	httpsftcmsmalformed: 'https:im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	http: httpCustomSchemeStore.toString(),
	httpmalformed: httpCustomSchemeStore.toString().replace('http://', 'http:/'),
	https: httpsCustomSchemeStore.toString(),
	httpsmalformed: httpsCustomSchemeStore.toString().replace('https://', 'https:/'),
	protocolRelative: httpsCustomSchemeStore.toString().replace('https:', ''),
	protocolRelativeftcms: '//im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img',
	nonUtf8Characters: 'https://origami-image-service-integration-tests.s3-eu-west-1.amazonaws.com/Beaute%CC%81.jpg',
	oldLiveBlogsDomainHttp: 'http://blogs.ft.com/tech-blog/files/2012/03/Screen-Shot-2012-03-01-at-11.25.02-PM-391x270.png',
	oldLiveBlogsDomainHttps: 'https://blogs.ft.com/tech-blog/files/2012/03/Screen-Shot-2012-03-01-at-11.25.02-PM-391x270.png',
	valid: `${(process.env.CUSTOM_SCHEME_STORE || process.env.HOST || 'https://origami-image-service-dev.herokuapp.com')}/__origami/service/image/v2/images/raw/ftsocial-v1%3Atwitter%3Fsource%3Dorigami-image-service`,
	notFound: 'http://google.com/404',
	nonSvg: 'http://im.ft-static.com/content/images/a60ae24b-b87f-439c-bf1b-6e54946b4cf2.img'
};
