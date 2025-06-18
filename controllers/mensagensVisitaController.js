const mensagensVisitaModel = require('../models/mensagensVisitaModel');

class MensagensVisitaController {
  async criar(req, res) {
    try {
      const {
        visita_id,
        numero_cliente,
        tipo_mensagem,
        conteudo,
        data_agendada,
      } = req.body;

      if (
        !visita_id ||
        !numero_cliente ||
        !tipo_mensagem ||
        !conteudo ||
        !data_agendada
      ) {
        return res
          .status(400)
          .json({ erro: 'Todos os campos são obrigatórios.' });
      }

      await mensagensVisitaModel.criarMensagem({
        visita_id,
        numero_cliente,
        tipo_mensagem,
        conteudo,
        data_agendada,
      });

      res.status(201).json({ mensagem: 'Mensagem agendada com sucesso!' });
    } catch (error) {
      console.error('Erro ao agendar mensagem:', error);
      res.status(500).json({ erro: 'Erro interno ao agendar mensagem.' });
    }
  }

  async buscarPorVisita(req, res) {
    try {
      const { visita_id } = req.params;

      const mensagens = await mensagensVisitaModel.buscarPorVisita(visita_id);

      res.status(200).json(mensagens);
    } catch (error) {
      console.error('Erro ao buscar mensagens da visita:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar mensagens.' });
    }
  }
}

module.exports = new MensagensVisitaController();
