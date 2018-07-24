'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('co-fs');
var utility = require('utility');

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
  options = Object.assign( {}, defaultOpts, options )
  options.baseUrl = options.baseUrl.replace(/\/$/, '') + '/';
  options.layout = options.layout || path.join(options.root, 'layout.html');
  // support custom markdown render
  if (typeof options.render !== 'function') {
    if (options.remarkableOptions) {
      throw new Error('koa-markdown is using markdown-it as default for markdown render, ' +
        'please pass `options.mdOptions` instead');
    }

    var md = require('markdown-it')(options.mdOptions);
    options.render = function (content) {
      return md.render(content);
    };
  }

  return function* markdown(next) {
    if (this.method !== 'GET') {
      return yield next;
    }
    var pathname = this.path;
    // get md file path

    // index file
    if (pathname + '/' === options.baseUrl
      || pathname === options.baseUrl) {
      pathname = options.baseUrl + options.indexName;
    }
    // folder index file
    if (pathname.lastIndexOf('/') === (pathname.length - 1) ) {
      pathname = pathname + options.indexName;
    };

    // check if match base url
    if (pathname.indexOf(options.baseUrl) !== 0) return yield next;
    pathname = pathname.replace(options.baseUrl, '');
    pathname = path.join(options.root, pathname + '.md');

    // generate html
    var html = yield getPage(pathname);
    if (html === null) {
      return yield next;
    }
    this.type = 'html';
    this.body = html;
  };

  function* getPage(filepath) {
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
    var html = utility.replace(layout, options.titleHolder, content.title);
    html = utility.replace(html, options.bodyHolder, content.body);

    if (options.cache) {
      cachePages[filepath] = html;
    }
    return html;
  }

  function* getLayout() {
    if (options.cache && cacheLayout) return cacheLayout;
    var layout = yield fs.readFile(options.layout, 'utf8');
    if (options.cache) cacheLayout = layout;
    return layout;
  }

  function* getContent(filepath) {
    var content = yield fs.readFile(filepath, 'utf8');
    var title = content.slice(0, content.indexOf('\n')).trim().replace(/^[#\s]+/, '');
    var body = options.render(content);
    return {
      title: title,
      body: body
    };
  }
};
