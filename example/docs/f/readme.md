rest markdown
-------------------------

```js
var koa = require('koa');
var markdown = require('..');
var app = koa();

app.use(markdown({
  baseUrl: '/docs',
  root: __dirname + '/docs',
  layout: __dirname + '/docs/layout.html',
  cache: true,
  indexName: 'readme'
}));

app.listen(7001);
console.log('app listening on 7001, visit http://localhost:7001/docs to visit');
```
