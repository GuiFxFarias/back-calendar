const { Router } = require('express');
const express = require('express');
const visitaController = require('../controllers/visitaController');
const clienteController = require('../controllers/clienteController');
const anexoController = require('../controllers/anexoController');
const userController = require('../controllers/userController');
const pagamentoController = require('../controllers/pagamentoController');
const mensagensVisitaController = require('../controllers/mensagensVisitaController');
const mensagensProgramadasController = require('../controllers/mensagemProgramadaController');
const upload = require('../middlewares/upload');
const autenticar = require('../middlewares/authMiddleware');

const router = Router();

// ===== ROTA PÚBLICA =====
// Login de usuario (SEM middleware de autenticação)
router.post('/login', userController.buscarUsers);
// Cadastrar usuário
router.post('/cadastra', userController.criarUsers);
// Esqueci a senha
router.post('/esqueci-senha', userController.esqueciSenha);
// Redefinir senha
router.post('/redefinir-senha', userController.redefinirSenha);

// ===== ROTAS PROTEGIDAS (COM middleware de autenticação) =====

// VISITAS
// Buscar visitas entre datas: /visitas?inicio=2025-06-10&fim=2025-06-16
router.get('/buscarVisita', autenticar, visitaController.listarPorData);
// Buscar todas as visitas
router.get('/todasVisitas', autenticar, visitaController.listarTodas);
// Buscar visita por ID
router.get('/visita/:id', autenticar, visitaController.buscarPorId);
// Criar nova visita
router.post(
  '/criarVisita',
  autenticar,
  upload.array('anexo_doc'),
  visitaController.criar
);
// Deletar visita
router.delete('/visita/:id', autenticar, visitaController.deletar);
// Editar visita
router.put(
  '/visita/:id',
  autenticar,
  upload.array('anexo_doc'),
  visitaController.editar
);

// CLIENTES
// Buscar todos os clientes
router.get('/clientes', autenticar, clienteController.listarTodos);
// Buscar cliente por ID
router.get('/cliente/:id', autenticar, clienteController.buscarPorId);
// Criar novo cliente
router.post('/criarCliente', autenticar, clienteController.criar);
// Criar novo cliente sem cadastro
router.post(
  '/clienteSemCadastro',
  autenticar,
  clienteController.criarSemCadastro
);
// Deletar cliente
router.delete('/cliente/:id', autenticar, clienteController.deletar);
// Editar cliente por id
router.put('/cliente/:id', autenticar, clienteController.atualizarCliente);
// Rota para adicionar anexos no cliente
router.post(
  '/anexos-cliente',
  autenticar,
  upload.array('arquivo'),
  anexoController.criarParaCliente
);
// Buscar anexos por cliente
router.get('/anexos-cliente/:id', autenticar, anexoController.listarPorCliente);
// Deletar anexos do cliente
router.delete('/anexos/:id', autenticar, anexoController.deletar);

// ANEXOS
// Buscar anexos por visita_id
router.get('/anexos/:visita_id', autenticar, anexoController.listarPorVisita);
// Baixar arquivo
router.get('/baixar/:nome', autenticar, anexoController.baixar);

// MENSAGENS
// Enviar mensagem
router.post('/mensagens-visita', autenticar, mensagensVisitaController.criar);
// Buscar mensagem por visita
router.get(
  '/mensagens-visita/:visita_id',
  autenticar,
  mensagensVisitaController.buscarPorVisita
);

// MENSAGENS PROGRAMADAS
// Cadastrar uma nova mensagem programada
router.post(
  '/mensagens-programadas',
  autenticar,
  mensagensProgramadasController.criar
);
// Listar todas as mensagens programadas
router.get(
  '/mensagens-programadas',
  autenticar,
  mensagensProgramadasController.listar
);
// Deletar uma mensagem programada
router.delete(
  '/mensagens-programadas/:id',
  autenticar,
  mensagensProgramadasController.deletar
);

// Editar uma mensagem programada
router.put(
  '/mensagens-programadas/:id',
  autenticar,
  mensagensProgramadasController.editar
);

//USUARIOS
// Logout de usuários
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ sucesso: true, mensagem: 'Logout efetuado' });
});

//PAGAMENTO
// Pagamentos
router.post('/pagamento', pagamentoController.criarCheckoutSession);

module.exports = router;
