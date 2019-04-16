'use strict';

const process = require('process');
const request = require('supertest');
const host = process.env.HOST || 'https://origami-image-service.in.ft.com';

describe('Origami-image-service', function () {
    this.timeout(30000);

    describe('image requests', () => {
        describe('Vary logic', () => {
            it('Varies with key FT-image-format', () => {
                return request(host)
                    .get('/__origami/service/image/v2/images/raw/http://www.elblogdelinfo.com/wp-content/uploads/alb_elias.jpg?source=vcl-test')
                    .expect(200)
                    .expect('vary', /FT-image-format/i);
            });
        });

        describe('Browsers which support webp', () => {
            it('Sets FT-image-format to webp', () => {
                return request(host)
                    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                    .get('/__origami/service/image/v2/images/raw/http://www.elblogdelinfo.com/wp-content/uploads/alb_elias.jpg?source=vcl-test')
                    .expect(200)
                    .expect('FT-image-format', 'webp')
                    .expect('vary', /FT-image-format/i);
            });
        });

        describe('Browsers which support jpeg-xr', () => {
            it('Sets FT-image-format to jpegxr', () => {
                return request(host)
                    .set('Accept', 'text/html, application/xhtml+xml, image/jxr, */*')
                    .get('/__origami/service/image/v2/images/raw/http://www.elblogdelinfo.com/wp-content/uploads/alb_elias.jpg?source=vcl-test')
                    .expect(200)
                    .expect('FT-image-format', 'jpegxr')
                    .expect('vary', /FT-image-format/i);
            });
        });

        describe('Browsers which do not support jpeg-xr or webp', () => {
            it('Set FT-image-format to default', () => {
                return request(host)
                    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
                    .get('/__origami/service/image/v2/images/raw/http://www.elblogdelinfo.com/wp-content/uploads/alb_elias.jpg?source=vcl-test')
                    .expect(200)
                    .expect('FT-image-format', 'default')
                    .expect('vary', /FT-image-format/i);
            });
        });
    });
});
