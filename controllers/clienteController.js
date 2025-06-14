const ClienteModel = require('../models/clienteModel');

class ClienteController {
  async listarTodos(req, res) {
    try {
      const clientes = await ClienteModel.buscarTodos();
      res.status(200).json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ erro: 'Erro interno ao listar clientes.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteModel.buscarPorId(id);

      if (resultado.length === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
      }

      res.status(200).json(resultado[0]);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar cliente.' });
    }
  }

  async criar(req, res) {
    try {
      const { nome, telefone, endereco } = req.body;

      if (!nome || !telefone || !endereco) {
        return res
          .status(400)
          .json({ erro: 'Todos os campos são obrigatórios.' });
      }

      await ClienteModel.criarCliente({ nome, telefone, endereco });
      res.status(201).json({ mensagem: 'Cliente criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao criar cliente.' });
    }
  }

  async criarSemCadastro(req, res) {
    try {
      const { nome } = req.body;

      if (!nome) {
        return res
          .status(400)
          .json({ erro: 'Todos os campos são obrigatórios.' });
      }

      const result = await ClienteModel.criarClienteSemCadastro({ nome });

      res.status(201).json({
        mensagem: 'Cliente criado com sucesso!',
        id: result.insertId,
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao criar cliente.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await ClienteModel.deletar(id);
      res.status(200).json({ mensagem: 'Cliente deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao deletar cliente.' });
    }
  }
}

module.exports = new ClienteController();
