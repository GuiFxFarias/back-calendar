const conexao = require('../conexao.js');

class VisitaModel {
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

  buscarPorData(dataInicio, dataFim) {
    const sql = `
      SELECT * FROM visitas
      WHERE data_visita BETWEEN ? AND ?
      ORDER BY data_visita ASC
    `;
    return this.executaQuery(sql, [dataInicio, dataFim]);
  }

  criarVisita({
    cliente_id,
    data_visita,
    preco,
    descricao,
    status,
    idAnexo = null,
  }) {
    const sql = `
      INSERT INTO visitas (cliente_id, data_visita, preco, descricao, status, idAnexo, criado_em)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    return this.executaQuery(sql, [
      cliente_id,
      data_visita,
      preco,
      descricao,
      status,
      idAnexo,
    ]);
  }

  buscarTodas() {
    const sql = 'SELECT * FROM visitas ORDER BY data_visita DESC';
    return this.executaQuery(sql);
  }

  buscarPorId(id) {
    const sql = 'SELECT * FROM visitas WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }

  deletar(id) {
    const sql = 'DELETE FROM visitas WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }

  editarVisita(id, { preco, status, idAnexo = null }) {
    const sql = `
    UPDATE visitas
    SET preco = ?, status = ?, idAnexo = ?
    WHERE id = ?
  `;
    return this.executaQuery(sql, [preco, status, idAnexo, id]);
  }
}

module.exports = new VisitaModel();
