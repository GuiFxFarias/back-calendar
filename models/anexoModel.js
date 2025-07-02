const conexao = require('../conexao.js');

class AnexoModel {
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

  criarAnexo({ visita_id, arquivo_url, tipo, tenant_id }) {
    const sql = `
      INSERT INTO anexos (visita_id, arquivo_url, tipo, tenant_id)
      VALUES (?, ?, ?)
    `;
    return this.executaQuery(sql, [visita_id, arquivo_url, tipo, tenant_id]);
  }

  buscarPorVisita(visita_id, tenant_id) {
    const sql =
      'SELECT * FROM anexos WHERE tenant_id = ? AND visita_id = ? ORDER BY criado_em ASC';
    return this.executaQuery(sql, [visita_id, tenant_id]);
  }

  deletar(id, tenant_id) {
    const sql = 'DELETE FROM anexos WHERE tenant_id = ? AND id = ?';
    return this.executaQuery(sql, [id, tenant_id]);
  }
}

module.exports = new AnexoModel();
