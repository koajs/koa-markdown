koa-markdown [![Build Status](https://secure.travis-ci.org/dead-horse/koa-markdown.png)](http://travis-ci.org/dead-horse/koa-markdown)
=========

Auto convert markdown to html for koa. Inspired by [connect-markdown](https://github.com/fengmk2/connect-markdown).

[![NPM](https://nodei.co/npm/koa-markdown.png?downloads=true)](https://nodei.co/npm/koa-markdown/)

## Usage

```js
var koa = require('koa');
var markdown = require('koa-markdown');

var app = koa();
app.use(markdown({
  root: __dirname + '/docs',
  baseUrl: '/docs'
}));

app.listen(7001);
```

Or you can checkout the [example](https://github.com/dead-horse/koa-markdown/tree/master/example).
## Options

* **root**: the markdown file root directory (required)
* **baseUrl**: base url of koa-markdown (required)
* **layout**: layout html file, default is `root`/layout.html
* **titleHolder**: title place holder in layout.html, default is {TITLE}
* **bodyHolder**: body place holder in layout.html, default is {BODY}
* **indexName**: request base url will get `indexName`.md, default is 'index'
* **cache**: cache the html page, default is `true`
* **markedOpts**: marked options

## Licences
(The MIT License)

Copyright (c) 2013 dead-horse and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
