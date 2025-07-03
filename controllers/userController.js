const userModel = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
  async buscarUsers(req, res) {
    const { email, senha } = req.body;

    try {
      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'E-mail e senha são obrigatórios',
        });
      }

      const resposta = await userModel.buscarUsers(email);

      if (!resposta || resposta.length === 0) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado',
        });
      }

      const usuario = resposta[0];
      // const hash = await bcrypt.hash(senha, 10);
      const senhaValida = await bcrypt.compare(String(senha), usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Senha incorreta',
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          tenant_id: usuario.tenant_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const expiration = new Date(Date.now() + 1000 * 60 * 60);

      return res.status(200).json({
        sucesso: true,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          tenant_id: usuario.tenant_id,
        },
        value: {
          token,
          tenant_id: usuario.tenant_id,
          expiration,
        },
      });
    } catch (erro) {
      console.error('Erro ao buscar usuário:', erro);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
      });
    }
  }
}

module.exports = new UserController();
