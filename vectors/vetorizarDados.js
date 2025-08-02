const vetorDB = require('./vectorDB');
const embeddingService = require('../services/embeddingService');

async function vetorizarAcoes() {
  const acoes = [
    'visitas_amanha',
    'visitas_canceladas_mes',
    'visitas_pendentes',
    'visitas_hoje',
    'visitas_realizadas_mes',
    'visitas_em_andamento',
    'visitas_por_cidade',
    'ultima_visita_dia',
    'primeira_visita_dia',
    'total_clientes',
    'clientes_novos_mes',
    'mensagens_programadas_hoje',
    'mensagens_ativas',
    'valor_total_pago_mes',
    'faturamento_a_partir',
    'visitas_pendentes_mes',
    'valor_pendente_mes',
    'mensagens_programadas_mes',
    'visitas_pendentes_hoje',
    'visita_realizadas_hoje',
    'valor_pendente_hoje',
    'valor_do_dia',
    'visitas_realizadas_no_dia_mes',
    'visitas_pendentes_no_dia_mes',
  ];

  console.log('🔍 Buscando vetores já existentes...');
  const vetoresExistentes = await vetorDB.buscarTodos();
  const textosExistentes = new Set(vetoresExistentes.map((v) => v.texto));

  for (const acao of acoes) {
    const textoSalvo = `ação::${acao}`;

    if (textosExistentes.has(textoSalvo)) {
      console.log(`⏩ Já existente: ${textoSalvo}`);
      continue;
    }

    const textoDescricao = gerarDescricaoDaAcao(acao);
    const embedding = await embeddingService.gerarEmbedding(textoDescricao);

    await vetorDB.inserirDocumento(textoSalvo, embedding);

    console.log(`✅ Vetorizado: ${textoSalvo}`);
  }

  console.log('🎉 Vetorização finalizada!');
}

function gerarDescricaoDaAcao(acao) {
  const descricoes = {
    visitas_amanha: 'Quantas visitas estão agendadas para amanhã?',
    visitas_canceladas_mes: 'Total de visitas canceladas neste mês.',
    mensagens_programadas_hoje:
      'Quantas mensagens estão programadas para hoje?',
    valor_total_pago_mes: 'Qual o valor total recebido neste mês?',
    visitas_pendentes: 'Quantas visitas ainda estão pendentes?',
    total_clientes: 'Quantos clientes estão cadastrados no sistema?',
    faturamento_a_partir:
      'Qual o faturamento total a partir de determinada data?',
    visitas_hoje: 'Quais são as visitas agendadas para hoje?',
    primeira_visita_dia: 'Qual é a primeira visita agendada do dia?',
    ultima_visita_dia: 'Qual é a última visita agendada do dia?',
    clientes_novos_mes: 'Quantos clientes foram cadastrados neste mês?',
    visitas_realizadas_mes: 'Quantas visitas foram realizadas neste mês?',
    visitas_em_andamento: 'Quantas visitas estão em andamento neste momento?',
    mensagens_ativas: 'Quantas mensagens programadas estão ativas?',
    visitas_por_cidade: 'Quantas visitas estão agendadas por cidade?',
    visitas_pendentes_mes: 'Quantas visitas estão pendentes neste mês?',
    valor_pendente_mes: 'Qual o valor total pendente de recebimento neste mês?',
    mensagens_programadas_mes:
      'Quantas mensagens estão programadas para este mês?',
    visitas_pendentes_hoje: 'Quantas visitas estão pendentes hoje?',
    visita_realizadas_hoje: 'Quantas visitas foram realizadas hoje?',
    valor_pendente_hoje: 'Qual o valor total de visitas pendentes hoje?',
    valor_do_dia: 'Qual o valor total recebido hoje?',
    visitas_realizadas_no_dia:
      'Quantas visitas foram realizadas no dia de hoje?',
    visitas_pendentes_no_dia: 'Quantas visitas estão pendentes no dia de hoje?',
  };

  return descricoes[acao] || acao.replace(/_/g, ' ');
}

vetorizarAcoes();
