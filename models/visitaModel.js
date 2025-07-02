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

  buscarPorData(dataInicio, dataFim, tenant_id) {
    const sql = `
      SELECT * FROM visitas
      WHERE tenant_id = ? AND data_visita BETWEEN ? AND ?
      ORDER BY data_visita ASC
    `;
    return this.executaQuery(sql, [tenant_id, dataInicio, dataFim]);
  }

  criarVisita(
    { cliente_id, data_visita, preco, descricao, status, idAnexo = null },
    tenant_id
  ) {
    const sql = `
      INSERT INTO visitas (cliente_id, data_visita, preco, descricao, status, idAnexo, tenant_id, criado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    return this.executaQuery(sql, [
      cliente_id,
      data_visita,
      preco,
      descricao,
      status,
      idAnexo,
      tenant_id,
    ]);
  }

  buscarTodas(tenant_id) {
    const sql =
      'SELECT * FROM visitas WHERE tenant_id = ? ORDER BY data_visita DESC';
    return this.executaQuery(sql, [tenant_id]);
  }

  buscarPorId(id, tenant_id) {
    const sql = 'SELECT * FROM visitas WHERE tenant_id = ? AND id = ?';
    return this.executaQuery(sql, [tenant_id, id]);
  }

  deletar(id, tenant_id) {
    const sql = 'DELETE FROM visitas WHERE tenant_id = ? AND id = ?';
    return this.executaQuery(sql, [tenant_id, id]);
  }

  editarVisita(id, { preco, status, idAnexo = null }, tenant_id) {
    const sql = `
      UPDATE visitas
      SET preco = ?, status = ?, idAnexo = ?
      WHERE tenant_id = ? AND id = ?
    `;
    return this.executaQuery(sql, [preco, status, idAnexo, tenant_id, id]);
  }
}

module.exports = new VisitaModel();
