const conexao = require('../conexao.js');

class TagModel {
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

  criar(nome, tenant_id) {
    const sql = `INSERT INTO tags (nome, tenant_id) VALUES (?, ?)`;
    return this.executaQuery(sql, [nome, tenant_id]).then(
      (res) => res.insertId
    );
  }

  listarPorTenant(tenant_id) {
    const sql = `SELECT * FROM tags WHERE tenant_id = ?`;
    return this.executaQuery(sql, [tenant_id]);
  }

  vincularTag(visita_id, tag_id) {
    const sql = `INSERT IGNORE INTO visita_tags (visita_id, tag_id) VALUES (?, ?)`;
    return this.executaQuery(sql, [visita_id, tag_id]);
  }

  desvincularTag(visita_id, tag_id) {
    const sql = `DELETE FROM visita_tags WHERE visita_id = ? AND tag_id = ?`;
    return this.executaQuery(sql, [visita_id, tag_id]);
  }

  listarTagsDaVisita(visita_id) {
    const sql = `
      SELECT t.id, t.nome 
      FROM visita_tags vt
      JOIN tags t ON vt.tag_id = t.id
      WHERE vt.visita_id = ?
    `;
    return this.executaQuery(sql, [visita_id]);
  }
}

module.exports = new TagModel();
