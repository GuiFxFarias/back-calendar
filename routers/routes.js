const { Router } = require('express');
const visitaController = require('../controllers/visitaController');
const clienteController = require('../controllers/clienteController');
const upload = require('../middlewares/upload');
const anexoController = require('../controllers/anexoController');
const router = Router();

// Buscar visitas entre datas: /visitas?inicio=2025-06-10&fim=2025-06-16
router.get('/buscarVisita', visitaController.listarPorData);

// Buscar todas as visitas (caso deseje usar)
router.get('/todasVisitas', visitaController.listarTodas);

// Buscar visita por ID
router.get('/visita:id', visitaController.buscarPorId);

// Criar nova visita
router.post('/criarVisita', upload.array('anexo_doc'), visitaController.criar);

// Deletar visita
router.delete('/visita:id', visitaController.deletar);

// Editar visita
router.put('/visita/:id', upload.array('anexo_doc'), visitaController.editar);

// Buscar todos os clientes
router.get('/clientes', clienteController.listarTodos);

// Buscar cliente por ID
router.get('/cliente/:id', clienteController.buscarPorId);

// Criar novo cliente
router.post('/criarCliente', clienteController.criar);

// Criar novo cliente sem cadastro
router.post('/clienteSemCadastro', clienteController.criarSemCadastro);

// Deletar cliente
router.delete('/cliente/:id', clienteController.deletar);

// Rota para buscar anexos por visita_id
router.get('/anexos/:visita_id', anexoController.listarPorVisita);

// Baixar arquivo
router.get('/baixar/:nome', anexoController.baixar);

module.exports = router;
