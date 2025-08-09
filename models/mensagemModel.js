const conexao = require('../conexao');

class MensagemModel {
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

  registrar({ tenant_id, role, content, meta = null }) {
    const sql = `
    INSERT INTO mensagens (tenant_id, role, content, meta)
    VALUES (?, ?, ?, ?)
  `;
    return this.executaQuery(sql, [
      tenant_id,
      role,
      content,
      meta ? JSON.stringify(meta) : null,
    ]);
  }

  async listarUltimas({ tenant_id, limit = 15 }) {
    const sql = `
    SELECT role, content, created_at
    FROM mensagens
    WHERE tenant_id = ?
    ORDER BY created_at ASC
    LIMIT ?
  `;
    const results = await this.executaQuery(sql, [tenant_id, limit]);
    return results.map((r) => ({
      role: r.role,
      content: r.content,
      created_at: r.created_at,
    }));
  }
}

module.exports = new MensagemModel();
