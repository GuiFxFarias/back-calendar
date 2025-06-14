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

  // Buscar todos os clientes
  buscarTodos() {
    const sql = 'SELECT * FROM clientes ORDER BY nome ASC';
    return this.executaQuery(sql);
  }

  // Buscar por ID
  buscarPorId(id) {
    const sql = 'SELECT * FROM clientes WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }

  // Criar novo cliente
  criarCliente({ nome, telefone, endereco }) {
    const sql =
      'INSERT INTO clientes (nome, telefone, endereco) VALUES (?, ?, ?)';
    return this.executaQuery(sql, [nome, telefone, endereco]);
  }

  criarClienteSemCadastro({ nome, telefone }) {
    const sql = 'INSERT INTO clientes (nome, telefone) VALUES (?, ?)';
    return this.executaQuery(sql, [nome, telefone]);
  }

  // Deletar cliente
  deletar(id) {
    const sql = 'DELETE FROM clientes WHERE id = ?';
    return this.executaQuery(sql, [id]);
  }
}

module.exports = new ClienteModel();
