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
    WHERE tenant_id = ?
      AND data_visita >= ?
      AND data_visita < DATE_ADD(?, INTERVAL 1 DAY)
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

  buscarVisitasAmanha(tenant_id) {
    const sql = `
      SELECT descricao, data_visita 
      FROM visitas 
      WHERE DATE(data_visita) = CURDATE() + INTERVAL 1 DAY
      AND tenant_id = ?
    `;
    return this.executaQuery(sql, [tenant_id]);
  }

  contarCanceladasMes(tenant_id) {
    const sql = `
      SELECT COUNT(*) as total 
      FROM visitas 
      WHERE status = 'cancelado' 
      AND MONTH(data_visita) = MONTH(CURDATE()) 
      AND YEAR(data_visita) = YEAR(CURDATE())
      AND tenant_id = ?
    `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  contarVisitasPendentes(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total 
    FROM visitas 
    WHERE status = 'pendente_visita' 
    AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  somarValorPagoMes(tenant_id) {
    const sql = `
      SELECT SUM(preco) as total 
      FROM visitas 
      WHERE status = 'pago' 
      AND MONTH(data_visita) = MONTH(CURDATE()) 
      AND YEAR(data_visita) = YEAR(CURDATE())
      AND tenant_id = ?
    `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total || 0);
  }

  contarVisitasHoje(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total 
    FROM visitas 
    WHERE DATE(data_visita) = CURDATE() 
    AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  buscarVisitasHojeDetalhado(tenant_id) {
    const sql = `
    SELECT 
      v.id,
      v.descricao,
      v.data_visita,
      v.status,
      c.nome AS nome_cliente,
      c.telefone,
      c.email
    FROM visitas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE DATE(v.data_visita) = CURDATE()
      AND v.tenant_id = ?
    ORDER BY v.data_visita ASC
  `;
    return this.executaQuery(sql, [tenant_id]);
  }

  buscarPrimeiraVisita(tenant_id) {
    const sql = `
    SELECT 
      c.nome AS nome_cliente, 
      TIME(v.data_visita) AS horario 
    FROM visitas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE DATE(v.data_visita) = CURDATE() 
      AND v.tenant_id = ? 
    ORDER BY v.data_visita ASC 
    LIMIT 1`;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0]);
  }

  buscarUltimaVisita(tenant_id) {
    const sql = `
    SELECT 
  c.nome AS nome_cliente, 
  TIME(v.data_visita) AS horario 
FROM visitas v
LEFT JOIN clientes c ON v.cliente_id = c.id
WHERE DATE(v.data_visita) = CURDATE() 
  AND v.tenant_id = ? 
ORDER BY v.data_visita DESC 
LIMIT 1`;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0]);
  }

  contarVisitasRealizadasMes(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total 
    FROM visitas 
    WHERE status = 'pago' 
    AND MONTH(data_visita) = MONTH(CURRENT_DATE())
    AND YEAR(data_visita) = YEAR(CURRENT_DATE())
    AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  contarVisitasEmAndamento(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total 
    FROM visitas 
    WHERE status = 'pendente_visita' 
    AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  contarVisitasPorCidade(tenant_id) {
    const sql = `
    SELECT cidade, COUNT(*) as total 
    FROM visitas 
    WHERE tenant_id = ? 
    GROUP BY cidade
  `;
    return this.executaQuery(sql, [tenant_id]);
  }

  contarVisitasPendentesMes(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total
    FROM visitas
    WHERE status = 'pendente_visita'
      AND MONTH(data_visita) = MONTH(CURDATE())
      AND YEAR(data_visita) = YEAR(CURDATE())
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  somarValorPendenteMes(tenant_id) {
    const sql = `
    SELECT SUM(preco) as total
    FROM visitas
    WHERE status = 'pendente_visita'
      AND MONTH(data_visita) = MONTH(CURDATE())
      AND YEAR(data_visita) = YEAR(CURDATE())
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then(
      (res) => Number(res[0].total) || 0
    );
  }

  contarVisitasRealizadasNoDia(tenant_id, dia, mes, ano) {
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

  contarVisitasPendentesNoDia(tenant_id, dia, mes, ano) {
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

  somarValorPendenteHoje(tenant_id) {
    const sql = `
    SELECT SUM(preco) as total
    FROM visitas
    WHERE status = 'pendente_visita'
      AND DATE(data_visita) = CURDATE()
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then(
      (res) => Number(res[0].total) || 0
    );
  }

  somarValorPagoHoje(tenant_id) {
    const sql = `
    SELECT SUM(preco) as total
    FROM visitas
    WHERE status = 'pago'
      AND DATE(data_visita) = CURDATE()
      AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then(
      (res) => Number(res[0].total) || 0
    );
  }
}

module.exports = new VisitaModel();
