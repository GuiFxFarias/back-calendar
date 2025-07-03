const path = require('path');
const router = require('./routes');
const autenticar = require('../middlewares/authMiddleware');

module.exports = (app, express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(router);
};
