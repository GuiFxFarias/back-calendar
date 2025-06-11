const AnexoModel = require('../models/anexoModel');

class AnexoController {
  async criar(req, res) {
    try {
      const { visita_id, arquivo_url, tipo } = req.body;

      if (!visita_id || !arquivo_url) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      await AnexoModel.criarAnexo({
        visita_id,
        arquivo_url,
        tipo: tipo || 'outro',
      });
      res.status(201).json({ mensagem: 'Anexo criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar anexo:', error);
      res.status(500).json({ erro: 'Erro interno ao criar anexo.' });
    }
  }

  async listarPorVisita(req, res) {
    try {
      const { visita_id } = req.params;
      const anexos = await AnexoModel.buscarPorVisita(visita_id);
      res.status(200).json(anexos);
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar anexos.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await AnexoModel.deletar(id);
      res.status(200).json({ mensagem: 'Anexo deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      res.status(500).json({ erro: 'Erro interno ao deletar anexo.' });
    }
  }
}

module.exports = new AnexoController();
