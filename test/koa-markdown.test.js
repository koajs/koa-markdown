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
var app = require('../example/app');
var request = require('supertest');
var markdown = require('..');

describe('test/koa-markdown.test.js', function () {
  it('should error with out options', function () {
    (function() {
      markdown();
    }).should.throw('options.root and options.baseUrl required');
    (function() {
      markdown({baseUrl: '/docs'});
    }).should.throw('options.root and options.baseUrl required');
    (function() {
      markdown({root: '/docs'});
    }).should.throw('options.root and options.baseUrl required');
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

  it('should request /docs/index/ 404', function (done) {
    request(app)
    .get('/docs/index/')
    .expect(404, done);
  });
});
