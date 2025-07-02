const ClienteModel = require('../models/clienteModel');

class ClienteController {
  async listarTodos(req, res) {
    try {
      const clientes = await ClienteModel.buscarTodos(req.tenantId);
      res.status(200).json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ erro: 'Erro interno ao listar clientes.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteModel.buscarPorId(id, req.tenantId);

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

      await ClienteModel.criarCliente({
        nome,
        telefone,
        endereco,
        tenant_id: req.tenantId,
      });

      res.status(201).json({ mensagem: 'Cliente criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao criar cliente.' });
    }
  }

  async criarSemCadastro(req, res) {
    try {
      const { nome, telefone } = req.body;

      if (!nome || !telefone) {
        return res
          .status(400)
          .json({ erro: 'Todos os campos são obrigatórios.' });
      }

      const result = await ClienteModel.criarClienteSemCadastro({
        nome,
        telefone,
        tenant_id: req.tenantId,
      });

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
      await ClienteModel.deletar(id, req.tenantId);

      res.status(200).json({ mensagem: 'Cliente deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);

      const mensagemErro =
        error?.code === 'ER_ROW_IS_REFERENCED_2'
          ? 'Não é possível deletar: existe uma visita vinculada a este cliente.'
          : error?.sqlMessage || 'Erro interno ao deletar cliente.';

      res.status(500).json({ erro: mensagemErro });
    }
  }

  async atualizarCliente(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, endereco } = req.body;

      if (!nome || !telefone) {
        return res
          .status(400)
          .json({ erro: 'Nome e telefone são obrigatórios.' });
      }

      const resultado = await ClienteModel.atualizarCliente({
        id,
        nome,
        telefone,
        endereco,
        tenant_id: req.tenantId,
      });

      if (resultado.affectedRows === 0) {
        return res
          .status(404)
          .json({ erro: 'Cliente não encontrado para atualização.' });
      }

      res.status(200).json({ mensagem: 'Cliente atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ erro: 'Erro interno ao atualizar cliente.' });
    }
  }
}

module.exports = new ClienteController();
