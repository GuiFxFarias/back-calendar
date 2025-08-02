const conexao = require('../conexao.js');

class ClienteModel {
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

  buscarTodos(tenant_id) {
    const sql = 'SELECT * FROM clientes WHERE tenant_id = ? ORDER BY nome ASC';
    return this.executaQuery(sql, [tenant_id]);
  }

  buscarPorId(id, tenant_id) {
    const sql = 'SELECT * FROM clientes WHERE tenant_id = ? AND id = ?';
    return this.executaQuery(sql, [tenant_id, id]);
  }

  criarCliente({ nome, telefone, endereco, tenant_id, email }) {
    const sql =
      'INSERT INTO clientes (nome, telefone, endereco, tenant_id, email) VALUES (?, ?, ?, ?, ?)';
    return this.executaQuery(sql, [nome, telefone, endereco, tenant_id, email]);
  }

  criarClienteSemCadastro({ nome, telefone, tenant_id }) {
    const sql =
      'INSERT INTO clientes (nome, telefone, tenant_id) VALUES (?, ?, ?)';
    return this.executaQuery(sql, [nome, telefone, tenant_id]);
  }

  atualizarCliente({ id, nome, telefone, endereco, tenant_id, email }) {
    const sql = `
      UPDATE clientes 
      SET nome = ?, telefone = ?, endereco = ?, email = ?
      WHERE tenant_id = ? AND id = ?
    `;
    return this.executaQuery(sql, [
      nome,
      telefone,
      endereco,
      email,
      tenant_id,
      id,
    ]);
  }

  deletar(id, tenant_id) {
    const sql = 'DELETE FROM clientes WHERE tenant_id = ? AND id = ?';
    return this.executaQuery(sql, [tenant_id, id]);
  }

  // IA PESQUISAS

  contarTotalClientes(tenant_id) {
    const sql = `SELECT COUNT(*) as total FROM clientes WHERE tenant_id = ?`;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }

  contarClientesNovosMes(tenant_id) {
    const sql = `
    SELECT COUNT(*) as total 
    FROM clientes 
    WHERE MONTH(criado_em) = MONTH(CURRENT_DATE()) 
    AND YEAR(criado_em) = YEAR(CURRENT_DATE())
    AND tenant_id = ?
  `;
    return this.executaQuery(sql, [tenant_id]).then((res) => res[0].total);
  }
}

module.exports = new ClienteModel();
