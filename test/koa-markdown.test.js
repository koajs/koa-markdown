/*!
 * koa-markdown - test/koa-markdown.test.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var path = require('path');
var Koa = require('koa');
var app = require('../example/app');
var request = require('supertest');
var markdown = require('..');

describe('test/koa-markdown.test.js', function () {
  it('should error with out options', function () {
    (function() {
      markdown();
    }).should.throw('options.root required');
    (function() {
      markdown({baseUrl: '/docs'});
    }).should.throw('options.root required');
  });

  it('should render with $& content', function (done) {
    request(app)
    .get('/docs/replace')
    .expect(/\$&amp;test/)
    .expect(200, done);
  });

  it( 'should render $ alone', function ( done ) {

    request( app )
      .get( '/docs/replace-alone' )
      .expect( /\${1}/g )
      .expect( res => {

        const testRegEx = /\${2}/g;

        if ( true === testRegEx.test( res.text ) ) {
          throw new Error( 'Found double dollar signs $$' )
        }

      })
      .expect( 200, done );

  });

  it('should request path not match 404', function (done) {
    request(app)
    .get('/docsabc')
    .expect(404, done);
  });

  it('should request method not match 404', function (done) {
    request(app)
    .post('/docs')
    .expect(404, done);
  });

  it('should request not exist file 404', function (done) {
    request(app)
    .get('/docs/not_exist')
    .expect(404, done);
  });

  it('should request /docs as index ok', function (done) {
    request(app)
    .get('/docs')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(/<title>koa-markdown<\/title>/)
    .expect(200, done);
  });

  it('should request /docs/ as index ok', function (done) {
    request(app)
    .get('/docs/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(/<title>koa-markdown<\/title>/)
    .expect(200, done);
  });

  it('should request /docs/index ok', function (done) {
    request(app)
    .get('/docs/index')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200, done);
  });

  it('should request folder /docs/f/ ok', function (done) {
    request(app)
    .get('/docs/f/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200, done);
  });

  it('should request /docs/index/ 404', function (done) {
    request(app)
    .get('/docs/index/')
    .expect(404, done);
  });

  describe('custom options.render', function () {
    it('should work', function (done) {
      var app = new Koa();
      var docs = path.join(__dirname, '..', 'example', 'docs');
      app.use(markdown({
        baseUrl: '/docs',
        root: docs,
        cache: true,
        render: function (content) {
          return 'hack content, length ' + content.length;
        }
      }));

      request(app.listen())
      .get('/docs')
      .expect(200)
      .expect(/hack content, length 352/, function (err) {
        should.not.exist(err);

        // should get from cache
        request(app.listen())
        .get('/docs')
        .expect(200)
        .expect(/hack content, length 352/, done);
      });
    });
  });
});
