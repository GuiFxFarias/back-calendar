const anexoModel = require('../models/anexoModel');
const path = require('path');

class AnexoController {
  async criar(req, res) {
    try {
      const { visita_id, cliente_id, arquivo_url, tipo } = req.body;

      if (!arquivo_url || (!visita_id && !cliente_id)) {
        return res
          .status(400)
          .json({ erro: 'Você deve informar visita_id ou cliente_id.' });
      }

      await anexoModel.criarAnexo(
        {
          visita_id,
          cliente_id,
          arquivo_url,
          tipo: tipo || 'outro',
        },
        req.tenantId
      );

      res.status(201).json({ mensagem: 'Anexo criado com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar anexo:', error);
      res.status(500).json({ erro: 'Erro interno ao criar anexo.' });
    }
  }

  async criarParaCliente(req, res) {
    const { cliente_id } = req.body;
    const arquivos = req.files;

    if (!cliente_id || !arquivos || arquivos.length === 0) {
      return res
        .status(400)
        .json({ erro: 'cliente_id e arquivo são obrigatórios.' });
    }

    try {
      for (const file of arquivos) {
        const arquivo_url = `/uploads/${file.filename}`;
        const tipo = file.mimetype;

        await anexoModel.criarAnexo(
          {
            cliente_id,
            arquivo_url,
            tipo,
            visita_id: null,
          },
          req.tenantId
        );
      }

      return res.status(201).json({ mensagem: 'Anexos enviados com sucesso.' });
    } catch (err) {
      console.error('Erro ao salvar anexos:', err);
      return res.status(500).json({ erro: 'Erro ao salvar anexos' });
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

  async listarPorCliente(req, res) {
    try {
      const { id } = req.params;

      const anexos = await anexoModel.buscarPorCliente(id, req.tenantId);
      res.status(200).json(anexos);
    } catch (error) {
      console.error('Erro ao buscar anexos do cliente:', error);
      res
        .status(500)
        .json({ erro: 'Erro interno ao buscar anexos do cliente.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await anexoModel.deletar(id, req.tenantId);
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
