const { Router } = require('express');
const visitaController = require('../controllers/visitaController');
const clienteController = require('../controllers/clienteController');
const anexoController = require('../controllers/anexoController');
const userController = require('../controllers/userController');
const mensagensVisitaController = require('../controllers/mensagensVisitaController');
const mensagensProgramadasController = require('../controllers/mensagemProgramadaController');
const upload = require('../middlewares/upload');
const autenticar = require('../middlewares/authMiddleware');

const router = Router();

// ===== ROTA PÚBLICA =====
// Login de usuario (SEM middleware de autenticação)
router.post('/login', userController.buscarUsers);

// ===== ROTAS PROTEGIDAS (COM middleware de autenticação) =====

// VISITAS
// Buscar visitas entre datas: /visitas?inicio=2025-06-10&fim=2025-06-16
router.get('/buscarVisita', autenticar, visitaController.listarPorData);
// Buscar todas as visitas
router.get('/todasVisitas', autenticar, visitaController.listarTodas);
// Buscar visita por ID (CORRIGIDO: adicionada barra antes de :id)
router.get('/visita/:id', autenticar, visitaController.buscarPorId);
// Criar nova visita
router.post(
  '/criarVisita',
  autenticar,
  upload.array('anexo_doc'),
  visitaController.criar
);
// Deletar visita (CORRIGIDO: adicionada barra antes de :id)
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

module.exports = router;
