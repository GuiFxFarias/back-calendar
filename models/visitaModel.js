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
    {
      cliente_id,
      data_visita,
      preco,
      descricao,
      status,
      idAnexo = null,
      is_recorrente = 0,
    },
    tenant_id
  ) {
    const sql = `
    INSERT INTO visitas (cliente_id, data_visita, preco, descricao, status, idAnexo, tenant_id, criado_em, is_recorrente)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
  `;
    return this.executaQuery(sql, [
      cliente_id,
      data_visita,
      preco,
      descricao,
      status,
      idAnexo,
      tenant_id,
      is_recorrente,
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

  // Visitas recorrencia
  criarRegraRecorrencia({
    visita_id,
    freq,
    intervalo = 1,
    dias_semana = null,
    fim_tipo = 'NEVER',
    fim_data = null,
    fim_qtd = null,
    tenant_id,
  }) {
    const sql = `
    INSERT INTO visitas_recorrencia (visita_id, freq, intervalo, dias_semana, fim_tipo, fim_data, fim_qtd, tenant_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const dias = Array.isArray(dias_semana)
      ? dias_semana.join(',')
      : dias_semana; // '1,3,5'
    return this.executaQuery(sql, [
      visita_id,
      freq,
      intervalo,
      dias,
      fim_tipo,
      fim_data,
      fim_qtd,
      tenant_id,
    ]);
  }

  atualizarRegraRecorrencia(
    tenant_id,
    visita_id,
    { freq, intervalo, dias_semana, fim_tipo, fim_data, fim_qtd }
  ) {
    const sets = [],
      params = [];
    if (freq !== undefined) {
      sets.push('freq = ?');
      params.push(freq);
    }
    if (intervalo !== undefined) {
      sets.push('intervalo = ?');
      params.push(intervalo);
    }
    if (dias_semana !== undefined) {
      const dias = Array.isArray(dias_semana)
        ? dias_semana.join(',')
        : dias_semana;
      sets.push('dias_semana = ?');
      params.push(dias);
    }
    if (fim_tipo !== undefined) {
      sets.push('fim_tipo = ?');
      params.push(fim_tipo);
    }
    if (fim_data !== undefined) {
      sets.push('fim_data = ?');
      params.push(fim_data);
    }
    if (fim_qtd !== undefined) {
      sets.push('fim_qtd = ?');
      params.push(fim_qtd);
    }
    if (!sets.length) return Promise.resolve({ affectedRows: 0 });

    const sql = `
    UPDATE visitas_recorrencia
    SET ${sets.join(', ')}
    WHERE visita_id = ? AND tenant_id = ?
  `;
    return this.executaQuery(sql, [...params, visita_id, tenant_id]);
  }

  removerRegraRecorrencia(tenant_id, visita_id) {
    const sql = `DELETE FROM visitas_recorrencia WHERE visita_id = ? AND tenant_id = ?`;
    return this.executaQuery(sql, [visita_id, tenant_id]);
  }

  buscarRegraPorVisita(tenant_id, visita_id) {
    const sql = `SELECT * FROM visitas_recorrencia WHERE visita_id = ? AND tenant_id = ? LIMIT 1`;
    return this.executaQuery(sql, [visita_id, tenant_id]).then(
      (r) => r[0] || null
    );
  }

  listarVisitasPaiComRegra(tenant_id) {
    const sql = `
    SELECT v.*, r.freq, r.intervalo, r.dias_semana, r.fim_tipo, r.fim_data, r.fim_qtd
    FROM visitas v
    JOIN visitas_recorrencia r ON r.visita_id = v.id
    WHERE v.tenant_id = ? AND v.is_recorrente = 1
  `;
    return this.executaQuery(sql, [tenant_id]);
  }

  // Visitas excecao
  listarExcecoes(tenant_id, visita_id, inicio, fim) {
    const sql = `
    SELECT *
    FROM visitas_excecoes
    WHERE tenant_id = ?
      AND visita_id = ?
      AND data_instancia BETWEEN ? AND ?
  `;
    return this.executaQuery(sql, [tenant_id, visita_id, inicio, fim]);
  }

  criarExcecaoSkip({ visita_id, data_instancia, tenant_id }) {
    const sql = `
    INSERT INTO visitas_excecoes (visita_id, data_instancia, tipo, tenant_id)
    VALUES (?, ?, 'SKIP', ?)
  `;
    return this.executaQuery(sql, [visita_id, data_instancia, tenant_id]);
  }

  criarExcecaoEdit({ visita_id, data_instancia, overrides = {}, tenant_id }) {
    const {
      novo_horario = null,
      novo_preco = null,
      nova_descricao = null,
      novo_status = null,
    } = overrides;
    const sql = `
    INSERT INTO visitas_excecoes (visita_id, data_instancia, tipo, novo_horario, novo_preco, nova_descricao, novo_status, tenant_id)
    VALUES (?, ?, 'EDIT', ?, ?, ?, ?, ?)
  `;
    return this.executaQuery(sql, [
      visita_id,
      data_instancia,
      novo_horario,
      novo_preco,
      nova_descricao,
      novo_status,
      tenant_id,
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
