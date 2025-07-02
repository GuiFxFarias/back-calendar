const path = require('path');
const router = require('./routes');
const identificarTenant = require('../middlewares/tenant'); // ✅ novo middleware

module.exports = (app, express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use(identificarTenant); // ✅ middleware antes das rotas
  app.use(router); // ✅ agora todas as rotas terão acesso ao req.tenantId
};
