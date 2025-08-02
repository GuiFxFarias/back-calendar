const tagModel = require('../models/tagsModel');

class TagController {
  async criarTag(req, res) {
    try {
      const { nome } = req.body;
      const tenant_id = req.tenantId;

      if (!nome) {
        return res.status(400).json({ erro: 'Nome da tag é obrigatório' });
      }

      const id = await tagModel.criar(nome, tenant_id);
      return res.status(201).json({ id, mensagem: 'Tag criada com sucesso' });
    } catch (err) {
      console.error('Erro ao criar tag:', err);
      return res.status(500).json({ erro: 'Erro ao criar tag' });
    }
  }

  async listarTags(req, res) {
    try {
      const tenant_id = req.tenantId;
      const tags = await tagModel.listarPorTenant(tenant_id);
      return res.json(tags);
    } catch (err) {
      console.error('Erro ao listar tags:', err);
      return res.status(500).json({ erro: 'Erro ao buscar tags' });
    }
  }

  async vincularTag(req, res) {
    try {
      const { visita_id, tag_id } = req.body;

      if (!visita_id || !tag_id) {
        return res
          .status(400)
          .json({ erro: 'visita_id e tag_id são obrigatórios' });
      }

      await tagModel.vincularTag(visita_id, tag_id);
      return res.json({ mensagem: 'Tag vinculada à visita' });
    } catch (err) {
      console.error('Erro ao vincular tag à visita:', err);
      return res.status(500).json({ erro: 'Erro ao vincular tag' });
    }
  }

  async listarTagsDaVisita(req, res) {
    try {
      const { visita_id } = req.params;

      if (!visita_id) {
        return res.status(400).json({ erro: 'visita_id é obrigatório' });
      }

      const tags = await tagModel.listarTagsDaVisita(visita_id);
      return res.json(tags);
    } catch (err) {
      console.error('Erro ao listar tags da visita:', err);
      return res.status(500).json({ erro: 'Erro ao buscar tags da visita' });
    }
  }

  async removerTag(req, res) {
    try {
      const { visita_id, tag_id } = req.body;

      if (!visita_id || !tag_id) {
        return res
          .status(400)
          .json({ erro: 'visita_id e tag_id são obrigatórios' });
      }

      await tagModel.desvincularTag(visita_id, tag_id);
      return res.json({ mensagem: 'Tag removida da visita' });
    } catch (err) {
      console.error('Erro ao remover tag da visita:', err);
      return res.status(500).json({ erro: 'Erro ao remover tag' });
    }
  }
}

module.exports = new TagController();
