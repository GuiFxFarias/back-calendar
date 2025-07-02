const anexoModel = require('../models/anexoModel');
const path = require('path');

class AnexoController {
  async criar(req, res) {
    try {
      const { visita_id, arquivo_url, tipo } = req.body;

      if (!visita_id || !arquivo_url) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      await anexoModel.criarAnexo(
        {
          visita_id,
          arquivo_url,
          tipo: tipo || 'outro',
        },
        req.tenantId
      ); // ✅ passando tenant_id

      res.status(201).json({ mensagem: 'Anexo criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar anexo:', error);
      res.status(500).json({ erro: 'Erro interno ao criar anexo.' });
    }
  }

  async listarPorVisita(req, res) {
    try {
      const { visita_id } = req.params;

      const anexos = await anexoModel.buscarPorVisita(visita_id, req.tenantId); // ✅ passa tenant
      res.status(200).json(anexos);
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar anexos.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await anexoModel.deletar(id, req.tenantId); // ✅ segura por tenant_id
      res.status(200).json({ mensagem: 'Anexo deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      res.status(500).json({ erro: 'Erro interno ao deletar anexo.' });
    }
  }

  async baixar(req, res) {
    const nomeArquivo = req.params.nome;
    const filePath = path.join(process.cwd(), 'uploads', nomeArquivo);

    res.download(filePath, nomeArquivo, (err) => {
      if (err) {
        console.error('Erro ao baixar:', err);
        res.status(500).json({ erro: 'Erro ao fazer download do arquivo.' });
      }
    });
  }
}

module.exports = new AnexoController();
