// controllers/visitaController.js
const anexoModel = require('../models/anexoModel.js');
const visitaModel = require('../models/visitaModel.js');
const clienteModel = require('../models/clienteModel.js');
const agendarNoGoogle = require('../services/googleCalendarService.js');
const path = require('path');

// + recorrência
const { RRule } = require('rrule');
const WEEK_MAP = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function toRRuleOptions(visitaPai, regra) {
  const freqMap = {
    DAILY: RRule.DAILY,
    WEEKLY: RRule.WEEKLY,
    MONTHLY: RRule.MONTHLY,
    YEARLY: RRule.YEARLY,
  };

  const opt = {
    freq: freqMap[regra.freq],
    interval: regra.intervalo || 1,
    dtstart: new Date(visitaPai.data_visita),
  };

  if (regra.fim_tipo === 'UNTIL' && regra.fim_data)
    opt.until = new Date(regra.fim_data);
  if (regra.fim_tipo === 'COUNT' && regra.fim_qtd) opt.count = regra.fim_qtd;

  if (regra.freq === 'WEEKLY' && regra.dias_semana) {
    const dias = String(regra.dias_semana)
      .split(',')
      .filter(Boolean)
      .map((s) => WEEK_MAP[parseInt(s, 10)])
      .map((code) => RRule[code]);
    if (dias.length) opt.byweekday = dias;
  }
  return opt;
}

function aplicarExcecoesEmOcorrencias(
  datas,
  visitaPai,
  excecoes,
  anexosPai,
  regra
) {
  const excluir = new Set(
    excecoes
      .filter((e) => e.tipo === 'SKIP')
      .map((e) => +new Date(e.data_instancia))
  );
  const edits = new Map(
    excecoes
      .filter((e) => e.tipo === 'EDIT')
      .map((e) => [+new Date(e.data_instancia), e])
  );
  const ocorrencias = [];

  for (const dt of datas) {
    const key = +dt;
    if (excluir.has(key)) continue;

    const dataStr = dt.toISOString().split('T')[0];

    let item = {
      id: `${visitaPai.id}-${dataStr}`,
      cliente_id: visitaPai.cliente_id,
      data_visita: dt.toISOString(),
      preco: visitaPai.preco,
      descricao: visitaPai.descricao,
      status: visitaPai.status,
      tenant_id: visitaPai.tenant_id,
      is_recorrente: 0,
      tags: visitaPai.tags || [],
      anexos: anexosPai || [], // Anexos da visita pai
      recorrencia: {
        // Recorrência herdada
        freq: regra.freq,
        intervalo: regra.intervalo,
        dias_semana: regra.dias_semana ? regra.dias_semana.split(',') : null,
        fim_tipo: regra.fim_tipo,
        fim_data: regra.fim_data,
        fim_qtd: regra.fim_qtd,
      },
    };

    if (edits.has(key)) {
      const e = edits.get(key);
      item = {
        ...item,
        data_visita: e.novo_horario
          ? new Date(e.novo_horario).toISOString()
          : item.data_visita,
        preco: e.novo_preco ?? item.preco,
        descricao: e.nova_descricao ?? item.descricao,
        status: e.novo_status ?? item.status,
      };
    }
    ocorrencias.push(item);
  }
  return ocorrencias;
}

class VisitaController {
  // GET /buscarVisita?inicio=...&fim=...
  async listarPorData(req, res) {
    try {
      const { inicio, fim } = req.query;
      if (!inicio || !fim) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros "inicio" e "fim" são obrigatórios.' });
      }

      // 1) Buscar visitas únicas do período
      const unicas = await visitaModel.buscarPorData(inicio, fim, req.tenantId);

      // ✅ Para cada visita única, buscar anexos e recorrência
      const unicasCompletas = await Promise.all(
        unicas.map(async (v) => {
          // Buscar anexos
          const anexos = await anexoModel.buscarPorVisita(v.id, req.tenantId);

          // Buscar regra de recorrência (se for recorrente)
          let recorrencia = null;
          if (v.is_recorrente === 1) {
            const regra = await visitaModel.buscarRegraPorVisita(
              req.tenantId,
              v.id
            );
            if (regra) {
              recorrencia = {
                freq: regra.freq,
                intervalo: regra.intervalo,
                dias_semana: regra.dias_semana
                  ? regra.dias_semana.split(',')
                  : null,
                fim_tipo: regra.fim_tipo,
                fim_data: regra.fim_data,
                fim_qtd: regra.fim_qtd,
              };
            }
          }

          return {
            ...v,
            anexos: anexos || [],
            recorrencia,
          };
        })
      );

      // 2) Expandir séries recorrentes no período
      const series = await visitaModel.listarVisitasPaiComRegra?.(req.tenantId);
      let ocorrencias = [];

      if (Array.isArray(series)) {
        const inicioDate = new Date(inicio);
        const fimDate = new Date(fim);

        for (const s of series) {
          const regra = {
            freq: s.freq,
            intervalo: s.intervalo,
            dias_semana: s.dias_semana,
            fim_tipo: s.fim_tipo,
            fim_data: s.fim_data,
            fim_qtd: s.fim_qtd,
          };

          const opt = toRRuleOptions(s, regra);
          const rule = new RRule(opt);
          const datas = rule.between(inicioDate, fimDate, true);

          // Filtrar data da visita pai
          const dataPai = new Date(s.data_visita);
          const datasFiltradas = datas.filter((data) => {
            return data.toDateString() !== dataPai.toDateString();
          });

          const excecoes = await visitaModel.listarExcecoes(
            req.tenantId,
            s.id,
            inicio,
            fim
          );

          // Buscar anexos da visita pai para herdar nas ocorrências
          const anexosPai = await anexoModel.buscarPorVisita(
            s.id,
            req.tenantId
          );

          const geradas = aplicarExcecoesEmOcorrencias(
            datasFiltradas,
            s,
            excecoes,
            anexosPai, // Passar anexos
            regra // Passar recorrência
          );

          ocorrencias = ocorrencias.concat(geradas);
        }
      }

      const resposta = [...unicasCompletas, ...ocorrencias].sort(
        (a, b) => new Date(a.data_visita) - new Date(b.data_visita)
      );

      res.status(200).json(resposta);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar visitas.' });
    }
  }

  // POST /criarVisita (suporta recorrência opcional)
  async criar(req, res) {
    try {
      const { cliente_id, preco, descricao, status } = req.body;
      const arquivos = req.files;

      if (
        !cliente_id ||
        !req.body.data_visita ||
        preco === undefined ||
        !descricao ||
        !status
      ) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      // +3h no data_visita (mantendo seu padrão)
      let data_visita = new Date(req.body.data_visita);
      data_visita = new Date(data_visita.getTime() + 3 * 60 * 60 * 1000);

      // detectar recorrência

      let recorrenciaPayload = null;
      if (req.body.recorrencia) {
        try {
          recorrenciaPayload =
            typeof req.body.recorrencia === 'string'
              ? JSON.parse(req.body.recorrencia)
              : req.body.recorrencia;
        } catch {
          return res
            .status(400)
            .json({ erro: 'recorrencia deve ser JSON válido.' });
        }
      }

      const is_recorrente = recorrenciaPayload ? 1 : 0;

      // 1. Cria a visita (pai se for recorrente)
      const resultado = await visitaModel.criarVisita(
        { cliente_id, data_visita, preco, descricao, status, is_recorrente },
        req.tenantId
      );

      const visita_id = resultado.insertId;
      let idAnexo = null;

      // 2. Salva os anexos (mesmo fluxo)
      if (arquivos && arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const file = arquivos[i];
          const arquivo_url = `${process.env.BASE_URL}/uploads/${file.filename}`;
          const tipo = file.mimetype;

          const anexo = await anexoModel.criarAnexo(
            { visita_id, arquivo_url, tipo },
            req.tenantId
          );

          if (i === 0) {
            idAnexo = anexo.insertId;
          }
        }

        await visitaModel.editarVisita(
          visita_id,
          { preco, status, idAnexo },
          req.tenantId
        );
      }

      // 3. Se for recorrente, criar regra
      if (recorrenciaPayload) {
        const { freq, intervalo, dias_semana, fim_tipo, fim_data, fim_qtd } =
          recorrenciaPayload;

        if (!freq) {
          return res
            .status(400)
            .json({ erro: 'freq é obrigatório quando recorrencia é enviada.' });
        }

        // Validações específicas
        if (freq === 'WEEKLY' && (!dias_semana || dias_semana.length === 0)) {
          return res.status(400).json({
            erro: 'dias_semana é obrigatório para recorrência semanal.',
          });
        }

        if (fim_tipo === 'UNTIL' && !fim_data) {
          return res.status(400).json({
            erro: 'fim_data é obrigatório quando fim_tipo é UNTIL.',
          });
        }

        if (fim_tipo === 'COUNT' && !fim_qtd) {
          return res.status(400).json({
            erro: 'fim_qtd é obrigatório quando fim_tipo é COUNT.',
          });
        }

        await visitaModel.criarRegraRecorrencia({
          visita_id,
          freq,
          intervalo: intervalo ?? 1,
          dias_semana: dias_semana || null,
          fim_tipo: fim_tipo ?? 'NEVER',
          fim_data: fim_data ? new Date(fim_data) : null,
          fim_qtd: fim_qtd ?? null,
          tenant_id: req.tenantId,
        });
      }

      res
        .status(201)
        .json({ mensagem: 'Visita criada com sucesso!', visita_id });
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      res.status(500).json({ erro: 'Erro interno ao criar visita.' });
    }
  }

  async listarTodas(req, res) {
    try {
      const visitas = await visitaModel.buscarTodas(req.tenantId);
      res.status(200).json(visitas);
    } catch (error) {
      console.error('Erro ao listar visitas:', error);
      res.status(500).json({ erro: 'Erro interno ao listar visitas.' });
    }
  }

  // GET /visita/:id  (retorna pai; se for série, inclui regra)
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await visitaModel.buscarPorId(id, req.tenantId);

      const visita = Array.isArray(resultado) ? resultado[0] : resultado;
      if (!visita) {
        return res.status(404).json({ erro: 'Visita não encontrada.' });
      }

      let regra = null;
      if (visita.is_recorrente) {
        regra = await visitaModel.buscarRegraPorVisita(req.tenantId, id);
      }

      res.status(200).json({ visita, recorrencia: regra });
    } catch (error) {
      console.error('Erro ao buscar visita por ID:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar visita.' });
    }
  }

  // DELETE /visita/:id
  // DELETE /visita/:id?scope=single|all   (novo)
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const { scope, data_instancia } = req.query;

      // Deletar só uma ocorrência (criar exceção SKIP)
      if (scope === 'single') {
        if (!data_instancia) {
          return res.status(400).json({
            erro: 'data_instancia é obrigatória para scope=single',
          });
        }

        // Extrair ID real se for virtual
        const idReal =
          typeof id === 'string' && id.includes('-') ? id.split('-')[0] : id;

        // CONVERTER para Date
        const dataInstanciaDate = new Date(data_instancia);

        await visitaModel.criarExcecaoSkip({
          visita_id: idReal,
          data_instancia: dataInstanciaDate,
          tenant_id: req.tenantId,
        });

        return res.status(200).json({
          mensagem: 'Ocorrência excluída com sucesso.',
        });
      }

      // Deletar toda a série
      if (scope === 'all') {
        const idReal =
          typeof id === 'string' && id.includes('-') ? id.split('-')[0] : id;

        await visitaModel.deletar(idReal, req.tenantId);
        return res.status(200).json({
          mensagem: 'Série excluída com sucesso.',
        });
      }

      // Deletar visita normal (sem scope)
      await visitaModel.deletar(id, req.tenantId);
      res.status(200).json({
        mensagem: 'Visita deletada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao deletar visita:', error);
      res.status(500).json({
        erro: 'Erro interno ao deletar visita.',
      });
    }
  }

  // PUT /visita/:id   (antigo)
  // PUT /visita/:id?scope=single|all|future&data_instancia=...&from=...   (novo)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { preco, status, idAnexo, cliente_id } = req.body;
      const arquivos = req.files;
      const { scope, data_instancia, from } = req.query;

      // --- fluxo novo: recorrência com scope ---
      if (scope) {
        if (scope === 'single') {
          if (!data_instancia) {
            return res
              .status(400)
              .json({ erro: 'data_instancia é obrigatória para scope=single' });
          }
          await visitaModel.criarExcecaoEdit({
            visita_id: id,
            data_instancia,
            overrides: {
              novo_horario: req.body.data_visita ?? null,
              novo_preco: req.body.preco ?? null,
              nova_descricao: req.body.descricao ?? null,
              novo_status: req.body.status ?? null,
            },
            tenant_id: req.tenantId,
          });
          return res
            .status(200)
            .json({ mensagem: 'Ocorrência atualizada (exceção EDIT).' });
        }

        if (scope === 'all') {
          // editar pai
          await visitaModel.editarVisitaPai(
            id,
            {
              preco: req.body.preco,
              status: req.body.status,
              idAnexo: req.body.idAnexo,
              cliente_id: req.body.cliente_id,
              data_visita: req.body.data_visita,
              descricao: req.body.descricao,
            },
            req.tenantId
          );

          // atualizar regra se veio
          if (req.body.recorrencia) {
            let rec = req.body.recorrencia;
            if (typeof rec === 'string') rec = JSON.parse(rec);
            await visitaModel.atualizarRegraRecorrencia(req.tenantId, id, rec);
          }
          return res
            .status(200)
            .json({ mensagem: 'Série (pai + regra) atualizada.' });
        }

        if (scope === 'future') {
          if (!from)
            return res
              .status(400)
              .json({ erro: 'from é obrigatório para scope=future' });

          // 1) encerra regra atual
          const ate = new Date(from);
          ate.setSeconds(ate.getSeconds() - 1);
          await visitaModel.atualizarRegraRecorrencia(req.tenantId, id, {
            fim_tipo: 'UNTIL',
            fim_data: ate.toISOString(),
          });

          // 2) cria novo pai a partir de "from" (com alterações desejadas)
          const pai = await visitaModel
            .buscarPorId(id, req.tenantId)
            .then((r) => (Array.isArray(r) ? r[0] : r));
          const novoPaiInsert = await visitaModel.criarVisita(
            {
              cliente_id: req.body.cliente_id ?? pai.cliente_id,
              data_visita: req.body.data_visita ?? from,
              preco: req.body.preco ?? pai.preco,
              descricao: req.body.descricao ?? pai.descricao,
              status: req.body.status ?? pai.status,
              idAnexo: req.body.idAnexo ?? pai.idAnexo,
              is_recorrente: 1,
            },
            req.tenantId
          );
          const novoId = novoPaiInsert.insertId;

          // 3) replica/atualiza a regra no novo pai
          let rec =
            req.body.recorrencia ||
            (await visitaModel.buscarRegraPorVisita(req.tenantId, id));
          if (typeof rec === 'string') rec = JSON.parse(rec);
          await visitaModel.criarRegraRecorrencia({
            visita_id: novoId,
            freq: rec.freq,
            intervalo: rec.intervalo ?? 1,
            dias_semana: rec.dias_semana ?? null,
            fim_tipo: rec.fim_tipo ?? 'NEVER',
            fim_data: rec.fim_data ?? null,
            fim_qtd: rec.fim_qtd ?? null,
            tenant_id: req.tenantId,
          });

          return res.status(200).json({
            mensagem: 'Série dividida a partir de "from".',
            novo_visita_id: novoId,
          });
        }

        return res.status(400).json({ erro: 'scope inválido' });
      }

      // --- fluxo antigo (sem scope): mantém seu comportamento atual ---
      if (preco === undefined || !status) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      let novoIdAnexo = idAnexo || null;

      // 1. anexos (mantém)
      if (arquivos && arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const file = arquivos[i];
          const arquivo_url = `${process.env.BASE_URL}/uploads/${file.filename}`;
          const tipo = file.mimetype;

          await anexoModel.criarAnexo(
            { cliente_id, visita_id: id, arquivo_url, tipo },
            req.tenantId
          );

          if (i === 0 && !idAnexo) {
            novoIdAnexo = id;
          }
        }
      }

      // 2. update (mantém)
      await visitaModel.editarVisita(
        id,
        { cliente_id, preco, status, idAnexo: novoIdAnexo },
        req.tenantId
      );

      res.status(200).json({ mensagem: 'Visita atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao editar visita:', error);
      res.status(500).json({ erro: 'Erro interno ao editar visita.' });
    }
  }
}

module.exports = new VisitaController();
