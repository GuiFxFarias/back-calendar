require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../conexao');
const pagamentoModel = require('../models/pagamentoModel');

async function criarCheckoutSession(req, res) {
  try {
    const { plano_id, usuario_id, tenant_id } = req.body;

    // Defina os planos com segurança no backend
    const planos = {
      mensal: { nome: 'Mensal', meses: 1, valor: 89 },
      trimestral: { nome: 'Trimestral', meses: 3, valor: 79 },
      semestral: { nome: 'Semestral', meses: 6, valor: 69 },
      anual: { nome: 'Anual', meses: 12, valor: 59 },
    };

    const plano = planos[plano_id];
    if (!plano) {
      return res.status(400).json({ erro: 'Plano inválido' });
    }

    const total = plano.valor * plano.meses;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      metadata: {
        usuario_id: String(usuario_id),
        tenant_id: String(tenant_id),
        plano_id,
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plano.nome}`,
            },
            unit_amount: total * 100, // em centavos
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/pagamento-sucesso`,
      cancel_url: `${process.env.FRONTEND_URL}/pagamento-cancelado`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    res.status(500).json({ erro: 'Erro interno ao criar pagamento' });
  }
}

async function verificarAcesso(req, res) {
  try {
    const usuario_id = req.usuarioId;
    const temAcesso = await pagamentoModel.verificarAcesso(usuario_id);

    res.status(200).json({ acessoLiberado: temAcesso });
  } catch (err) {
    console.error('Erro ao verificar acesso:', err);
    res.status(500).json({ erro: 'Erro interno ao verificar acesso' });
  }
}

async function webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // req.body é o buffer cru (graças ao express.raw())
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Erro ao validar webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('✅ Webhook processado corretamente!');
    console.log('📦 Session:', session);

    const usuario_id = session.metadata?.usuario_id;
    const tenant_id = session.metadata?.tenant_id;
    const plano_id = session.metadata?.plano_id;
    const valor = session.amount_total / 100;
    const stripe_session_id = session.id;
    const status = session.payment_status;

    // Validação básica
    if (!usuario_id || !tenant_id || !plano_id || !valor) {
      console.error('❌ Dados incompletos no metadata do webhook');
      return res.status(400).send('Dados incompletos para registrar pagamento');
    }

    try {
      await db.execute(
        `INSERT INTO pagamentos (
          usuario_id, tenant_id, plano_id, stripe_session_id, status, valor, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [usuario_id, tenant_id, plano_id, stripe_session_id, status, valor]
      );

      console.log(
        `✅ Pagamento registrado no banco para usuário ${usuario_id}`
      );
    } catch (err) {
      console.error('❌ Erro ao salvar pagamento no banco:', err);
      return res.status(500).send('Erro ao salvar pagamento');
    }
  }

  return res.status(200).json({ received: true });
}

module.exports = {
  criarCheckoutSession,
  webhook,
  verificarAcesso,
};
