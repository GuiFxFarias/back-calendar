const visitaModel = require('../models/visitaModel');
const mensagemModel = require('../models/mensagemProgramadaModel');
const clienteModel = require('../models/clienteModel');
const pagamentoModel = require('../models/pagamentoModel');

const iaActions = {
  visitas_amanha: async (tenant_id) => {
    const visitas = await visitaModel.buscarVisitasAmanha(tenant_id);
    return visitas.length
      ? visitas
          .map(
            (v) =>
              `• ${v.descricao} às ${new Date(v.data_visita).toLocaleTimeString(
                'pt-BR'
              )}`
          )
          .join('\n')
      : 'Nenhuma visita encontrada para amanhã.';
  },

  visitas_canceladas_mes: async (tenant_id) => {
    const total = await visitaModel.contarCanceladasMes(tenant_id);
    return `Total de visitas canceladas este mês: ${total}`;
  },

  mensagens_programadas_hoje: async (tenant_id) => {
    const mensagens = await mensagemModel.listarDeHoje(tenant_id);
    return mensagens.length
      ? mensagens.map((m) => `• ${m.texto} para ${m.telefone}`).join('\n')
      : 'Nenhuma mensagem programada para hoje.';
  },

  valor_total_pago_mes: async (tenant_id) => {
    const valor = await visitaModel.somarValorPagoMes(tenant_id);
    return `Total recebido este mês: R$ ${valor.toFixed(2)}`;
  },

  visitas_pendentes: async (tenant_id) => {
    const totalPendentes = await visitaModel.contarVisitasPendentes(tenant_id);
    return `Total de visitas pendentes: ${totalPendentes}`;
  },

  total_clientes: async (tenant_id) => {
    const total = await clienteModel.contarTotalClientes(tenant_id);
    return `Total de clientes cadastrados: ${total}`;
  },

  faturamento_a_partir: async (tenant_id) => {
    const total = await pagamentoModel.totalFaturadoMes(tenant_id);
    return `Valor total faturado neste mês: R$ ${total.toFixed(2)}`;
  },

  visitas_hoje: async (tenant_id) => {
    const visitas = await visitaModel.buscarVisitasHojeDetalhado(tenant_id);

    if (!visitas || visitas.length === 0) {
      return 'Não há visitas agendadas para hoje.';
    }

    const formatadas = visitas.map((v) => {
      const dataHora = new Date(v.data_visita).toLocaleString('pt-BR');
      return `🧾 Cliente: ${
        v.nome_cliente
      }\n📅 Data/Hora: ${dataHora}\n📍 Descrição: ${v.descricao}\n📞 Contato: ${
        v.telefone || 'Não informado'
      }`;
    });

    return `📋 Visitas de hoje:\n\n${formatadas.join('\n\n')}`;
  },

  primeira_visita_dia: async (tenant_id) => {
    const visita = await visitaModel.buscarPrimeiraVisita(tenant_id);
    return visita
      ? `Primeira visita do dia: ${visita.nome_cliente}, às ${visita.horario}`
      : `Nenhuma visita agendada para hoje.`;
  },

  ultima_visita_dia: async (tenant_id) => {
    const visita = await visitaModel.buscarUltimaVisita(tenant_id);
    return visita
      ? `Última visita do dia: ${visita.nome_cliente}, às ${visita.horario}`
      : `Nenhuma visita agendada para hoje.`;
  },

  clientes_novos_mes: async (tenant_id) => {
    const total = await clienteModel.contarClientesNovosMes(tenant_id);
    return `Clientes novos cadastrados neste mês: ${total}`;
  },

  visitas_realizadas_mes: async (tenant_id) => {
    const total = await visitaModel.contarVisitasRealizadasMes(tenant_id);
    return `Visitas realizadas neste mês: ${total}`;
  },

  visitas_em_andamento: async (tenant_id) => {
    const total = await visitaModel.contarVisitasEmAndamento(tenant_id);
    return `Visitas em andamento no momento: ${total}`;
  },

  mensagens_ativas: async (tenant_id) => {
    const total = await mensagemModel.contarMensagensAtivas(tenant_id);
    return `Mensagens programadas ativas: ${total}`;
  },

  visitas_pendentes_mes: async (tenant_id) => {
    const total = await visitaModel.contarVisitasPendentesMes(tenant_id);
    return `Visitas pendentes neste mês: ${total}`;
  },

  valor_pendente_mes: async (tenant_id) => {
    const total = await visitaModel.somarValorPendenteMes(tenant_id);
    return `Valor total pendente neste mês: R$ ${total.toFixed(2)}`;
  },

  mensagens_programadas_mes: async (tenant_id) => {
    const total = await mensagemModel.contarMensagensMes(tenant_id);
    return `Mensagens programadas para este mês: ${total}`;
  },

  visitas_por_cidade: async (tenant_id) => {
    const dados = await visitaModel.contarVisitasPorCidade(tenant_id);
    return dados
      .map((item) => `${item.cidade}: ${item.total} visitas`)
      .join('\n');
  },

  visitas_pendentes_hoje: async (tenant_id) => {
    const total = await visitaModel.contarVisitasPendentesHoje(tenant_id);
    return `Visitas pendentes para hoje: ${total}`;
  },

  visita_realizadas_hoje: async (tenant_id) => {
    const total = await visitaModel.contarVisitasRealizadasHoje(tenant_id);
    return `Visitas realizadas hoje: ${total}`;
  },

  valor_pendente_hoje: async (tenant_id) => {
    const total = await visitaModel.somarValorPendenteHoje(tenant_id);
    return `Valor pendente de hoje: R$ ${total.toFixed(2)}`;
  },

  valor_do_dia: async (tenant_id) => {
    const total = await visitaModel.somarValorPagoHoje(tenant_id);
    return `Valor total recebido hoje: R$ ${total.toFixed(2)}`;
  },

  visitas_realizadas_no_dia_mes: async (tenant_id, { dia, mes, ano }) => {
    const total = await visitaModel.contarVisitasRealizadasNoDia(
      tenant_id,
      dia,
      mes,
      ano
    );
    return `Visitas realizadas em ${dia}/${mes}/${ano}: ${total}`;
  },

  visitas_pendentes_no_dia_mes: async (tenant_id, { dia, mes, ano }) => {
    const total = await visitaModel.contarVisitasPendentesNoDia(
      tenant_id,
      dia,
      mes,
      ano
    );
    return `Visitas pendentes em ${dia}/${mes}/${ano}: ${total}`;
  },
};

module.exports = iaActions;
