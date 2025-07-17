const conexao = require('../conexao.js');

class PagamentoModel {
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

  buscarPagamentoValido(usuario_id, tenant_id) {
    const sql = `
      SELECT plano_id, criado_em
      FROM pagamentos
      WHERE usuario_id = ? AND tenant_id = ? AND status = 'paid'
      ORDER BY criado_em DESC
      LIMIT 1
    `;
    return this.executaQuery(sql, [usuario_id, tenant_id]);
  }

  async verificarAcesso(usuario_id) {
    const diasPlano = {
      mensal: 30,
      trimestral: 90,
      semestral: 180,
      anual: 365,
    };

    // Verifica pagamento mais recente
    const sqlPagamento = `
      SELECT plano_id, criado_em 
      FROM pagamentos 
      WHERE usuario_id = ? AND status = 'paid'
      ORDER BY criado_em DESC 
      LIMIT 1
    `;

    const pagamentos = await this.executaQuery(sqlPagamento, [usuario_id]);

    if (pagamentos.length > 0) {
      const { plano_id, criado_em } = pagamentos[0];
      const diasValidos = diasPlano[plano_id] || 0;
      const dataExpiracao = new Date(criado_em);
      dataExpiracao.setDate(dataExpiracao.getDate() + diasValidos);

      const agora = new Date();
      if (agora <= dataExpiracao) return true;
    }

    // Se não pagou, verifica se está dentro dos 7 dias grátis
    const sqlUsuario = `
      SELECT criado_em FROM usuarios WHERE id = ?
    `;
    const usuarios = await this.executaQuery(sqlUsuario, [usuario_id]);

    if (usuarios.length === 0) return false;

    const criadoEm = new Date(usuarios[0].criado_em);
    const expiracaoGratuita = new Date(criadoEm);
    expiracaoGratuita.setDate(expiracaoGratuita.getDate() + 7);

    const agora = new Date();
    return agora <= expiracaoGratuita;
  }
}

module.exports = new PagamentoModel();
