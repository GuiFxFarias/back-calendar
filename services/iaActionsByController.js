const visitaModel = require('../models/visitaModel');
const mensagemModel = require('../models/mensagemProgramadaModel');
const clienteModel = require('../models/clienteModel');
const pagamentoModel = require('../models/pagamentoModel');

const iaActions = {
  visitas_pendentes_hoje: async (tenant_id, { dia, mes, ano }) => {
    const total = await visitaModel.contarVisitasPendentesHoje(
      tenant_id,
      dia,
      mes,
      ano
    );
    return `Visitas pendentes em ${dia}/${mes}/${ano}: ${total}`;
  },
  detalhe_visita_pendente_hoje: async (tenant_id, { dia, mes, ano }) => {
    const visitas = await visitaModel.detalheVisitasPendentesHoje(
      tenant_id,
      dia,
      mes,
      ano
    );

    console.log(visitas);

    if (!visitas.length) {
      return 'Nenhuma visita pendente encontrada para hoje.';
    }

    const detalhes = visitas
      .map(
        (v) =>
          `• Cliente: ${v.cliente} | Horário: ${new Date(
            v.data_visita
          ).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })} | Valor: R$ ${v.preco}`
      )
      .join('\n');

    console.log(detalhes);

    return `📋 Visitas pendentes em ${dia}/${mes}/${ano}:\n${detalhes}`;
  },
  visitas_pagas_hoje: async (tenant_id, { dia, mes, ano }) => {
    const total = await visitaModel.contarVisitasPagasHoje(
      tenant_id,
      dia,
      mes,
      ano
    );
    return `Visitas pagas em ${dia}/${mes}/${ano}: ${total}`;
  },
  detalhe_visita_paga_hoje: async (tenant_id, { dia, mes, ano }) => {
    const visitas = await visitaModel.detalheVisitasPagasHoje(
      tenant_id,
      dia,
      mes,
      ano
    );

    console.log(visitas);

    if (!visitas.length) {
      return 'Nenhuma visita pendente encontrada para hoje.';
    }

    const detalhes = visitas
      .map(
        (v) =>
          `• Cliente: ${v.cliente} | Horário: ${new Date(
            v.data_visita
          ).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })} | Valor: R$ ${v.preco}`
      )
      .join('\n');

    console.log(detalhes);

    return `📋 Visitas pendentes em ${dia}/${mes}/${ano}:\n${detalhes}`;
  },
  visitas_pendente_recebimento_hoje: async (tenant_id, { dia, mes, ano }) => {
    const total = await visitaModel.contarVisitasPendenteRecebimentoHoje(
      tenant_id,
      dia,
      mes,
      ano
    );
    return `Visitas pagas em ${dia}/${mes}/${ano}: ${total}`;
  },
};

module.exports = iaActions;
