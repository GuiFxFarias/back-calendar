const { Router } = require('express');
const visitaController = require('../controllers/visitaController');
const clienteController = require('../controllers/clienteController');
const anexoController = require('../controllers/anexoController');
const userController = require('../controllers/userController');
const mensagensVisitaController = require('../controllers/mensagensVisitaController');
const mensagensProgramadasController = require('../controllers/mensagemProgramadaController');
const {
  authRedirect,
  oauthCallback,
} = require('../controllers/oauthController');
const upload = require('../middlewares/upload');
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

// Editar cliente por id
router.put('/cliente/:id', clienteController.atualizarCliente);

// Rota para buscar anexos por visita_id
router.get('/anexos/:visita_id', anexoController.listarPorVisita);

// Baixar arquivo
router.get('/baixar/:nome', anexoController.baixar);

// Login de usuario
router.post('/login', userController.buscarUsers);

// Rota para enviar mensagem
router.post('/mensagens-visita', mensagensVisitaController.criar);

// Rota para buscar mensagem por visita
router.get(
  '/mensagens-visita/:visita_id',
  mensagensVisitaController.buscarPorVisita
);

//Cadastrar uma nova mensagem programada para um cliente
router.post('/mensagens-programadas', mensagensProgramadasController.criar);

// Listar todas as mensagens programadas existentes
router.get('/mensagens-programadas', mensagensProgramadasController.listar);

// Deletar uma mensagem programada com base no ID
router.delete(
  '/mensagens-programadas/:id',
  mensagensProgramadasController.deletar
);

module.exports = router;
