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
    tenant_id,
  }) {
    const sql = `
      INSERT INTO mensagens_programadas
      (cliente_id, telefone, texto, dias_intervalo, proxima_data_envio, ativo, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return this.executaQuery(sql, [
      cliente_id,
      telefone,
      texto,
      dias_intervalo,
      proxima_data_envio,
      ativo,
      tenant_id,
    ]);
  }

  buscarTodas(tenant_id) {
    const sql = `
    SELECT 
      m.*,
      c.nome AS nome_cliente
    FROM mensagens_programadas m
    LEFT JOIN clientes c ON m.cliente_id = c.id
    WHERE m.tenant_id = ?
    ORDER BY m.proxima_data_envio ASC
  `;
    return this.executaQuery(sql, [tenant_id]);
  }

  buscarPorCliente(cliente_id, tenant_id) {
    const sql = `
      SELECT * FROM mensagens_programadas
      WHERE tenant_id = ? AND cliente_id = ?
    `;
    return this.executaQuery(sql, [tenant_id, cliente_id]);
  }

  deletar(id, tenant_id) {
    const sql = `
      DELETE FROM mensagens_programadas
      WHERE tenant_id = ? AND id = ?
    `;
    return this.executaQuery(sql, [tenant_id, id]);
  }
}

module.exports = new MensagemProgramadaModel();
