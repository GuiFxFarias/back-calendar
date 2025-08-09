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
    SELECT
    v.*,
    JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'nome', t.nome)) AS tags
    FROM visitas v
    LEFT JOIN visita_tags vt ON vt.visita_id = v.id
    LEFT JOIN tags t ON t.id = vt.tag_id
    WHERE v.tenant_id = ?
      AND v.data_visita >= ?
      AND v.data_visita < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY v.id
    ORDER BY v.data_visita ASC;
  `;
    return this.executaQuery(sql, [tenant_id, dataInicio, dataFim]).then(
      (resultados) =>
        resultados.map((visita) => ({
          ...visita,
          tags: Array.isArray(visita.tags)
            ? visita.tags
            : JSON.parse(visita.tags),
        }))
    );
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

  editarVisita(id, { preco, status, idAnexo, cliente_id }, tenant_id) {
    const sql = `
      UPDATE visitas
      SET preco = ?, status = ?, idAnexo = ?
      WHERE tenant_id = ? AND id = ? AND cliente_id = ?
    `;
    return this.executaQuery(sql, [
      preco,
      status,
      idAnexo,
      tenant_id,
      id,
      cliente_id,
    ]);
  }

  // IA PESQUISAS

  // Eventos pendentes
  // Contagem de visitas pendentes
  contarVisitasPendentesHoje(tenant_id, dia, mes, ano) {
    const sql = `
    SELECT COUNT(*) as total
    FROM visitas
    WHERE status = 'pendente_visita'
      AND DAY(data_visita) = ?
      AND MONTH(data_visita) = ?
      AND YEAR(data_visita) = ?
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [dia, mes, ano, tenant_id]).then(
      (res) => res[0].total
    );
  }
  // Detalhe das visitas pendentes hoje
  detalheVisitasPendentesHoje(tenant_id, dia, mes, ano) {
    const sql = `
    SELECT 
      v.id,
      c.nome AS cliente,
      v.data_visita,
      v.preco,
      v.descricao
    FROM visitas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    WHERE v.status = 'pendente_visita'
      AND DAY(v.data_visita) = ?
      AND MONTH(v.data_visita) = ?
      AND YEAR(v.data_visita) = ?
      AND v.tenant_id = ?
    ORDER BY v.data_visita ASC
  `;
    return this.executaQuery(sql, [dia, mes, ano, tenant_id]);
  }
  // Detalhe das visitas pagas hoje
  detalheVisitasPagasHoje(tenant_id, dia, mes, ano) {
    const sql = `
    SELECT 
      v.id,
      c.nome AS cliente,
      v.data_visita,
      v.preco,
      v.descricao
    FROM visitas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    WHERE v.status = 'pago'
      AND DAY(v.data_visita) = ?
      AND MONTH(v.data_visita) = ?
      AND YEAR(v.data_visita) = ?
      AND v.tenant_id = ?
    ORDER BY v.data_visita ASC
  `;
    return this.executaQuery(sql, [dia, mes, ano, tenant_id]);
  }

  // Eventos pagos
  // Contagem de visitas pagas
  contarVisitasPagasHoje(tenant_id, dia, mes, ano) {
    const sql = `
    SELECT COUNT(*) as total
    FROM visitas
    WHERE status = 'pago'
      AND DAY(data_visita) = ?
      AND MONTH(data_visita) = ?
      AND YEAR(data_visita) = ?
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [dia, mes, ano, tenant_id]).then(
      (res) => res[0].total
    );
  }
  // Eventos pendente_recebimento
  // Contagem de visitas pendente_recebimento
  contarVisitasPendenteRecebimentoHoje(tenant_id, dia, mes, ano) {
    const sql = `
    SELECT COUNT(*) as total
    FROM visitas
    WHERE status = 'pendente_recebimento'
      AND DAY(data_visita) = ?
      AND MONTH(data_visita) = ?
      AND YEAR(data_visita) = ?
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [dia, mes, ano, tenant_id]).then(
      (res) => res[0].total
    );
  }
}

module.exports = new VisitaModel();
