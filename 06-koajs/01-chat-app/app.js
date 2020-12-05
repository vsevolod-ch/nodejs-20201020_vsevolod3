const path = require('path');
const Koa = require('koa');
const Clients = require('./clients');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.status = 500;
    ctx.body = 'server error';
  }
});

const Router = require('koa-router');
const router = new Router();
const clients = new Clients();

router.get('/subscribe', async (ctx, next) => {
  const [id, p] = clients.setClient();
  ctx.req.on('aborted', () => {
    clients.deleteClient(id);
  });
  ctx.body = await p;
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  if (!message) ctx.throw(400, 'Message must be passed.');
  if (clients.count()) {
    const clientHandlers = clients.getClients();
    for (const client of clientHandlers) client(message);
  }
  ctx.body = 'success';
});

app.use(router.routes());

module.exports = app;
