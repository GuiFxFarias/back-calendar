const anexoModel = require('../models/anexoModel.js');
const visitaModel = require('../models/visitaModel.js');
const clienteModel = require('../models/clienteModel.js');
const agendarNoGoogle = require('../services/googleCalendarService.js');
const path = require('path');

class VisitaController {
  async listarPorData(req, res) {
    try {
      const { inicio, fim } = req.query;

      if (!inicio || !fim) {
        return res
          .status(400)
          .json({ erro: 'Parâmetros "inicio" e "fim" são obrigatórios.' });
      }

      const visitas = await visitaModel.buscarPorData(
        inicio,
        fim,
        req.tenantId
      );
      res.status(200).json(visitas);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar visitas.' });
    }
  }

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

      // Adiciona +3h ao data_visita
      let data_visita = new Date(req.body.data_visita);
      data_visita = new Date(data_visita.getTime() + 3 * 60 * 60 * 1000);

      // 1. Cria a visita
      const resultado = await visitaModel.criarVisita(
        {
          cliente_id,
          data_visita,
          preco,
          descricao,
          status,
        },
        req.tenantId
      );

      const visita_id = resultado.insertId;
      let idAnexo = null;

      // 2. Salva os anexos
      if (arquivos && arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const file = arquivos[i];
          const arquivo_url = `${process.env.BASE_URL}/uploads/${file.filename}`;
          const tipo = file.mimetype;

          const anexo = await anexoModel.criarAnexo(
            {
              visita_id,
              arquivo_url,
              tipo,
            },
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

      // 3. Busca nome e email do cliente
      const cliente = await clienteModel.buscarPorId(cliente_id, req.tenantId);

      if (cliente[0]?.email) {
        await agendarNoGoogle.criarEventoNoCalendar({
          nomeCliente: cliente[0].nome,
          emailCliente: cliente[0].email,
          data_visita, // já com +3h
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

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const resultado = await visitaModel.buscarPorId(id, req.tenantId);

      if (resultado.length === 0) {
        return res.status(404).json({ erro: 'Visita não encontrada.' });
      }

      res.status(200).json(resultado[0]);
    } catch (error) {
      console.error('Erro ao buscar visita por ID:', error);
      res.status(500).json({ erro: 'Erro interno ao buscar visita.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await visitaModel.deletar(id, req.tenantId);
      res.status(200).json({ mensagem: 'Visita deletada com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar visita:', error);
      res.status(500).json({ erro: 'Erro interno ao deletar visita.' });
    }
  }

  async editar(req, res) {
    try {
      const { id } = req.params;
      const { preco, status, idAnexo, cliente_id } = req.body;
      const arquivos = req.files;

      if (preco === undefined || !status) {
        return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
      }

      let novoIdAnexo = idAnexo || null;

      // 1. Se houver anexos enviados, salva todos e define o primeiro como idAnexo (caso não informado)
      if (arquivos && arquivos.length > 0) {
        for (let i = 0; i < arquivos.length; i++) {
          const file = arquivos[i];
          const arquivo_url = `${process.env.BASE_URL}/uploads/${file.filename}`;
          const tipo = file.mimetype;

          await anexoModel.criarAnexo(
            {
              cliente_id,
              visita_id: id,
              arquivo_url,
              tipo,
            },
            req.tenantId
          );

          if (i === 0 && !idAnexo) {
            novoIdAnexo = id;
          }
        }
      }

      // 2. Atualiza a visita com novos dados
      await visitaModel.editarVisita(
        id,
        {
          cliente_id,
          preco,
          status,
          idAnexo: novoIdAnexo,
        },
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
