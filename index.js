/*!
 * koa-markdown - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Remarkable = require('remarkable');
var assert = require('assert');
var copy = require('copy-to');
var path = require('path');
var fs = require('co-fs');

var cachePages = {};
var cacheLayout;

var defaultOpts = {
  cache: false,
  titleHolder: '{TITLE}',
  bodyHolder: '{BODY}',
  indexName: 'index',
  baseUrl: '/'
};

module.exports = function (options) {
  assert(options && options.root, 'options.root required');
  copy(defaultOpts).to(options);
  options.baseUrl = options.baseUrl.replace(/\/$/, '') + '/';
  options.layout = options.layout || path.join(options.root, 'layout.html');
  var md = new Remarkable();
  if (options.remarkableOptions) {
    md.set(options.remarkableOptions);
  }

  return function* markdown(next) {
    if (this.method !== 'GET') {
      return yield* next;
    }
    var pathname = this.path;
    // get md file path

    // index file
    if (pathname + '/' === options.baseUrl
      || pathname === options.baseUrl) {
      pathname = options.baseUrl + options.indexName;
    }

    // check if match base url
    if (pathname.indexOf(options.baseUrl) !== 0) return yield* next;
    pathname = pathname.replace(options.baseUrl, '');
    pathname = path.join(options.root, pathname + '.md');

    // generate html
    var html = yield* getPage(pathname);
    if (html === null) {
      return yield* next;
    }
    this.type = 'html';
    this.body = html;
  };

  function *getPage(filepath) {
    if (options.cache && filepath in cachePages) {
      return cachePages[filepath];
    }
    var r;
    try {
      r = yield [getLayout(), getContent(filepath)];
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }

    var layout = r[0];
    var content = r[1];
    var html = layout.replace(options.titleHolder, content.title)
      .replace(options.bodyHolder, content.body);

    if (options.cache) {
      cachePages[filepath] = html;
    }
    return html;
  }

  function *getLayout() {
    if (options.cache && cacheLayout) return cacheLayout;
    var layout = yield fs.readFile(options.layout, 'utf8');
    if (options.cache) cacheLayout = layout;
    return layout;
  }

  function *getContent(filepath) {
    var content = yield fs.readFile(filepath, 'utf8');
    var title = content.slice(0, content.indexOf('\n')).trim().replace(/^[#\s]+/, '');
    var body = md.render(content);
    return {
      title: title,
      body: body
    };
  }
};
