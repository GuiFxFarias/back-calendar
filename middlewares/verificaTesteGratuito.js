const pagamentoModel = require('../models/pagamentoModel');

async function verificaAcessoLiberado(usuario) {
  const DIAS_TOLERANCIA = 7;
  const hoje = new Date();

  // 1. Verifica se ainda está no teste gratuito
  if (usuario.inicio_teste_gratis) {
    const diasPassados =
      (hoje - new Date(usuario.inicio_teste_gratis)) / (1000 * 60 * 60 * 24);

    if (diasPassados < DIAS_TOLERANCIA) {
      return true;
    }
  }

  // 2. Verifica se existe pagamento válido
  const resultado = await pagamentoModel.buscarPagamentoValido(
    usuario.id,
    usuario.tenant_id
  );

  if (!resultado || resultado.length === 0) {
    return false;
  }

  const { plano_id, criado_em } = resultado[0];
  const dataPagamento = new Date(criado_em);

  let diasValidos = 0;
  if (plano_id === 'mensal') diasValidos = 30;
  else if (plano_id === 'trimestral') diasValidos = 90;
  else if (plano_id === 'anual') diasValidos = 365;

  const diffDias =
    (hoje.getTime() - dataPagamento.getTime()) / (1000 * 60 * 60 * 24);

  return diffDias < diasValidos;
}

module.exports = { verificaAcessoLiberado };
