function verificaTesteGratuito(req, res, next) {
  const usuario = req.usuario; // ou req.user, dependendo do seu auth middleware
  if (!usuario || !usuario.inicio_teste_gratis) return next();

  const diasPassados =
    (new Date() - new Date(usuario.inicio_teste_gratis)) /
    (1000 * 60 * 60 * 24);

  if (diasPassados >= 7) {
    return res.status(403).json({
      sucesso: false,
      erro: 'Seu teste gratuito expirou.',
    });
  }

  next();
}
