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
const iaController = require('../controllers/iaController');
const tagController = require('../controllers/tagController');

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
router.get('/buscarVisita', autenticar, visitaController.listarPorData);
router.get('/todasVisitas', autenticar, visitaController.listarTodas);
router.get('/visita/:id', autenticar, visitaController.buscarPorId);
router.post(
  '/criarVisita',
  autenticar,
  upload.array('anexo_doc'),
  visitaController.criar
);
router.delete('/visita/:id', autenticar, visitaController.deletar);
router.put(
  '/visita/:id',
  autenticar,
  upload.array('anexo_doc'),
  visitaController.editar
);

// IA
router.post('/ia/perguntar', autenticar, iaController.perguntar);

// TAGS
router.post('/tags', autenticar, tagController.criarTag);
router.get('/tags', autenticar, tagController.listarTags);
router.post('/tags/vincular', autenticar, tagController.vincularTag);
router.post('/tags/remover', autenticar, tagController.removerTag);
router.get(
  '/tags/visita/:visita_id',
  autenticar,
  tagController.listarTagsDaVisita
);

// CLIENTES
router.get('/clientes', autenticar, clienteController.listarTodos);
router.get('/cliente/:id', autenticar, clienteController.buscarPorId);
router.post('/criarCliente', autenticar, clienteController.criar);
router.post(
  '/clienteSemCadastro',
  autenticar,
  clienteController.criarSemCadastro
);
router.delete('/cliente/:id', autenticar, clienteController.deletar);
router.put('/cliente/:id', autenticar, clienteController.atualizarCliente);
router.post(
  '/anexos-cliente',
  autenticar,
  upload.array('arquivo'),
  anexoController.criarParaCliente
);
router.get('/anexos-cliente/:id', autenticar, anexoController.listarPorCliente);
router.delete('/anexos/:id', autenticar, anexoController.deletar);

// ANEXOS
router.get('/anexos/:visita_id', autenticar, anexoController.listarPorVisita);
router.get('/baixar/:nome', autenticar, anexoController.baixar);

// MENSAGENS
router.post('/mensagens-visita', autenticar, mensagensVisitaController.criar);
router.get(
  '/mensagens-visita/:visita_id',
  autenticar,
  mensagensVisitaController.buscarPorVisita
);

// MENSAGENS PROGRAMADAS
router.post(
  '/mensagens-programadas',
  autenticar,
  mensagensProgramadasController.criar
);
router.get(
  '/mensagens-programadas',
  autenticar,
  mensagensProgramadasController.listar
);
router.delete(
  '/mensagens-programadas/:id',
  autenticar,
  mensagensProgramadasController.deletar
);
router.put(
  '/mensagens-programadas/:id',
  autenticar,
  mensagensProgramadasController.editar
);

// USUÁRIOS
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ sucesso: true, mensagem: 'Logout efetuado' });
});

// Usuário atual do sistema
router.get('/usuario', autenticar, userController.usuarioAtual);

// PAGAMENTOS
router.post('/pagamento', pagamentoController.criarCheckoutSession);

// WEBHOOK STRIPE (SEM auth, COM express.raw)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  pagamentoController.webhook
);

router.get('/acesso', autenticar, pagamentoController.verificarAcesso);

module.exports = router;
