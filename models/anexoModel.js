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

  criarAnexo({ visita_id, arquivo_url, tipo }) {
    const sql = `
      INSERT INTO anexos (visita_id, arquivo_url, tipo)
      VALUES (?, ?, ?)
    `;
    return this.executaQuery(sql, [visita_id, arquivo_url, tipo]);
  }

  buscarPorVisita(visita_id) {
    const sql =
      'SELECT * FROM anexos WHERE visita_id = ? ORDER BY criado_em ASC';
    return this.executaQuery(sql, [visita_id]);
  }

  deletar(id) {
    const sql = 'DELETE FROM anexos WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }
}

module.exports = new AnexoModel();
