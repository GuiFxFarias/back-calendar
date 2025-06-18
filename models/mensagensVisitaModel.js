const conexao = require('../conexao.js');

class MensagensVisitaModel {
  executaQuery(sql, parametros) {
    return new Promise((res, rej) => {
      conexao.query(sql, parametros, (error, results) => {
        if (error) {
          console.log('Erro na query: ' + error);
          return rej(error);
        }
        return res(results);
      });
    });
  }

  criarMensagem({
    visita_id,
    numero_cliente,
    tipo_mensagem,
    conteudo,
    data_agendada,
  }) {
    const sql = `
      INSERT INTO mensagens_visita 
      (visita_id, numero_cliente, tipo_mensagem, conteudo, data_agendada)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.executaQuery(sql, [
      visita_id,
      numero_cliente,
      tipo_mensagem,
      conteudo,
      data_agendada,
    ]);
  }

  buscarPorVisita(visita_id) {
    const sql = `
      SELECT * FROM mensagens_visita 
      WHERE visita_id = ?
      ORDER BY data_agendada ASC
    `;
    return this.executaQuery(sql, [visita_id]);
  }

  atualizarStatus(id, status, data_envio = null) {
    const sql = `
      UPDATE mensagens_visita
      SET status_envio = ?, data_envio = ?
      WHERE id = ?
    `;
    return this.executaQuery(sql, [status, data_envio, id]);
  }
}

module.exports = new MensagensVisitaModel();
