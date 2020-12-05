const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();
let clients = [];

router.get('/subscribe', async (ctx, next) => {
  const index = clients.length;
  const p = new Promise((resolve) => clients.push(resolve));
  ctx.req.on('aborted', () => {
    clients.length && clients.splice(index, 1);
  });
  try {
    ctx.body = await p;
  } catch (e) {
    ctx.throw(500, 'server error');
  }
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  if (!message) ctx.throw(400, 'Message must be passed.');
  if (clients.length) {
    for (const client of clients) {
      if (typeof client === 'function') client(message);
    }
    clients = [];
  }
  ctx.body = 'success';
});

app.use(router.routes());

module.exports = app;
