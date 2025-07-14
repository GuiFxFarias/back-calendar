const path = require('path');
const router = require('./routes');
const pagamentoWebhookRoute = require('./pagamentoWebHookRoute');

module.exports = (app, express) => {
  app.use(
    '/webhook',
    express.raw({ type: 'application/json' }),
    pagamentoWebhookRoute
  );

  // Agora sim aplica os parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(router);
};
