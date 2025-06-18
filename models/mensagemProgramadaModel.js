const conexao = require('../conexao.js');

class MensagemProgramadaModel {
  executaQuery(sql, parametros) {
    return new Promise((res, rej) => {
      conexao.query(sql, parametros, (erro, results) => {
        if (erro) {
          console.log('Erro na query: ' + erro);
          return rej(erro);
        }
        return res(results);
      });
    });
  }

  criar({
    cliente_id,
    telefone,
    texto,
    dias_intervalo,
    proxima_data_envio,
    ativo,
  }) {
    const sql = `
    INSERT INTO mensagens_programadas
    (cliente_id, telefone, texto, dias_intervalo, proxima_data_envio, ativo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    return this.executaQuery(sql, [
      cliente_id,
      telefone,
      texto,
      dias_intervalo,
      proxima_data_envio,
      ativo,
    ]);
  }

  buscarTodas() {
    const sql =
      'SELECT * FROM mensagens_programadas ORDER BY proxima_data_envio ASC';
    return this.executaQuery(sql);
  }

  buscarPorCliente(cliente_id) {
    const sql = 'SELECT * FROM mensagens_programadas WHERE cliente_id = ?';
    return this.executaQuery(sql, [cliente_id]);
  }

  deletar(id) {
    const sql = 'DELETE FROM mensagens_programadas WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }
}

module.exports = new MensagemProgramadaModel();
