const jwt = require('jsonwebtoken');
const db = require('../conexao');

async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido ou malformado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.id;
    const tenantId = decoded.tenant_id;

    // Consultar o usuário no banco
    const [usuarios] = await db.query(
      'SELECT fim_teste_gratis FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuarios.length) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const fimTeste = new Date(usuarios[0].fim_teste_gratis);
    const hoje = new Date();

    // Verifica se está dentro do período de teste
    const emTeste = fimTeste >= hoje;

    // Verifica se existe pagamento aprovado
    const [pagamentos] = await db.query(
      'SELECT id FROM pagamentos WHERE usuario_id = ? LIMIT 1',
      [usuarioId]
    );

    const pagou = pagamentos.length > 0;

    if (!emTeste && !pagou) {
      return res
        .status(403)
        .json({ erro: 'Teste expirado. Faça o pagamento para continuar.' });
    }

    // Libera acesso
    req.usuarioId = usuarioId;
    req.tenantId = tenantId;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
