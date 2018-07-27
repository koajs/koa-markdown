'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('mz/fs')

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
  options = Object.assign( {}, defaultOpts, options );
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

  return async function markdown(ctx, next) {
    if (ctx.request.method !== 'GET') {
      return await next();
    }
    var pathname = ctx.request.path;
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
    if (pathname.indexOf(options.baseUrl) !== 0) {
      return await next();
    }
    pathname = pathname.replace(options.baseUrl, '');
    pathname = path.join(options.root, pathname + '.md');

    // generate html
    var html = await getPage(pathname);
    if (html === null) {
      return await next();
    }
    ctx.type = 'html';
    ctx.body = html;
  };

  async function getPage(filepath) {
    if (options.cache && filepath in cachePages) {
      return cachePages[filepath];
    }
    var r;
    try {
      r = [ await getLayout(), await getContent(filepath)];
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }

    var layout = r[0];
    var content = r[1];

    /**
     * Using .replace() will break down with a few specific strings.
     * Example: $& which will insert "the matched substring."
     * Since "{TITLE}" is the matched substring, our test case "$&test" returns "{TITLE}test"
     * Replacing $ with $$ prevents this.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
     */

    // Mutating title and body
    content.title = content.title.replace( /\${1}/g, '$$$' );
    content.body = content.body.replace( /\${1}/g, '$$$' );

    var htmlWithTitle = layout.replace( options.titleHolder, content.title );
    var htmlWithContent = htmlWithTitle.replace( options.bodyHolder, content.body );

    if (options.cache) {
      cachePages[filepath] = htmlWithContent;
    }
    return htmlWithContent;
  }

  async function getLayout() {
    if (options.cache && cacheLayout) return cacheLayout;

    let layout;

    try {

      layout = await fs.readFile( options.layout, 'utf-8' );

    } catch( err ) {

      throw err;

    }

    if (options.cache) cacheLayout = layout;
    return layout;
  }

  async function getContent(filepath) {

    let content;

    try{

      content = await fs.readFile( filepath, 'utf-8' );

    } catch( err ) {

      throw err;

    }

    var title = content.slice(0, content.indexOf('\n')).trim().replace(/^[#\s]+/, '');
    var body = options.render(content);
    return {
      title: title,
      body: body
    };
  }
};
