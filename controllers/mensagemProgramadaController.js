const mensagemProgramadaModel = require('../models/mensagemProgramadaModel');

function formatarTelefoneParaTwilio(telefone) {
  const apenasNumeros = telefone.replace(/\D/g, '');

  const comDDI = apenasNumeros.startsWith('55')
    ? apenasNumeros
    : `55${apenasNumeros}`;

  return `whatsapp:+${comDDI}`;
}

class MensagemProgramadaController {
  async criar(req, res) {
    try {
      const {
        cliente_id,
        telefone,
        texto,
        dias_intervalo,
        proxima_data_envio,
        ativo,
      } = req.body;

      if (
        !cliente_id ||
        !telefone ||
        !texto ||
        !dias_intervalo ||
        !proxima_data_envio
      ) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      await mensagemProgramadaModel.criar({
        cliente_id,
        telefone: formatarTelefoneParaTwilio(telefone),
        texto,
        dias_intervalo,
        proxima_data_envio,
        ativo,
        tenant_id: req.tenantId, // ✅ tenant incluído
      });

      res
        .status(201)
        .json({ mensagem: 'Mensagem programada criada com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar mensagem programada:', error);
      res
        .status(500)
        .json({ erro: 'Erro interno ao criar mensagem programada.' });
    }
  }

  async listar(req, res) {
    try {
      const mensagens = await mensagemProgramadaModel.buscarTodas(req.tenantId);
      res.status(200).json(mensagens);
    } catch (error) {
      console.error('Erro ao listar mensagens:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar mensagens.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await mensagemProgramadaModel.deletar(id, req.tenantId); // ✅ deleção segura
      res.status(200).json({ mensagem: 'Mensagem deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      res.status(500).json({ erro: 'Erro interno ao deletar mensagem.' });
    }
  }
}

module.exports = new MensagemProgramadaController();
