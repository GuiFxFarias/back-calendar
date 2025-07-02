// middlewares/tenant.js
module.exports = function identificarTenant(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(400).json({ erro: 'Tenant ID não informado.' });
  }

  req.tenantId = tenantId;
  next();
};
