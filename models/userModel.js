const conexao = require('../conexao.js');

class UserModel {
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

  buscarUsers(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    return this.executaQuery(sql, [email]);
  }

  buscarPorEmailETenant(email, tenant_id) {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND tenant_id = ?';
    return this.executaQuery(sql, [email, tenant_id]);
  }

  buscarPorTenant(tenant_id) {
    const sql = 'SELECT * FROM usuarios WHERE tenant_id = ?';
    return this.executaQuery(sql, [tenant_id]);
  }

  criarUsuario({ nome, email, senha, tenant_id }) {
    const sql =
      'INSERT INTO usuarios (nome, email, senha, tenant_id) VALUES (?, ?, ?, ?)';
    return this.executaQuery(sql, [nome, email, senha, tenant_id]);
  }
}

module.exports = new UserModel();
