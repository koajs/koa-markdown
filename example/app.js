var koa = require('koa');
var markdown = require('..');
var app = koa();

app.use(markdown({
  baseUrl: '/docs',
  root: __dirname + '/docs',
  layout: __dirname + '/docs/layout.html',
  cache: false,
  indexName: 'readme'
}));

app.use(function *() {
  this.status = 404;
  this.body = 'page not found';
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(7001);
  console.log('app listening on 7001, visit http://localhost:7001/docs to visit');
}

module.exports = app.callback();
