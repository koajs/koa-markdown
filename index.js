/*!
 * koa-markdown - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var marked = require('marked');
var path = require('path');
var fs = require('co-fs');

var cachePages = {};
var cacheLayout;

module.exports = function (options) {
  if (!options || !options.root || !options.baseUrl) {
    throw new Error('options.root and options.baseUrl required');
  }
  options.baseUrl = options.baseUrl.replace(/\/$/, '');
  options.layout = options.layout || path.join(options.root, 'layout.html');
  options.cache = options.cache === false ? false : true;
  options.titleHolder = options.titleHolder || '{TITLE}';
  options.bodyHolder = options.bodyHolder || '{BODY}';
  options.indexName = options.indexName || 'index';

  if (options.markedOpts) {
    marked.setOptions(options.markedOpts);
  }

  function *getPage(filepath) {
    if (options.cache && filepath in cachePages) {
      return cachePages[filepath];
    }
    try {
      var r = yield [getLayout(), getContent(filepath)];
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
    if (options.cache && cacheLayout) {
      return cacheLayout;
    }
    var layout = yield fs.readFile(options.layout, 'utf8');
    return layout;
  }

  function *getContent(filepath) {
    var content = yield fs.readFile(filepath, 'utf8');
    var title = content.slice(0, content.indexOf('\n')).trim().replace(/^[#\s]+/, '');
    var body = marked(content);
    return {
      title: title,
      body: body
    };
  }

  return function * markdown(next) {
    if (this.method !== 'GET') {
      return yield next;
    }
    var pathname = this.path;

    // check if match base url
    var matchPath = pathname.indexOf(options.baseUrl + '/') === 0 ||
      pathname === options.baseUrl;
    if (!matchPath) {
      return yield next;
    }

    // get md file path
    pathname = pathname.replace(options.baseUrl, '');
    if (pathname === '/' || pathname === '') {
      pathname = '/' + options.indexName;
    }
    pathname = path.join(options.root, pathname + '.md');

    // generate html
    var html = yield getPage(pathname);
    if (html === null) {
      return yield next;
    }
    this.type = 'text/html';
    this.charset = 'utf-8';
    this.body = html;
  };
};
