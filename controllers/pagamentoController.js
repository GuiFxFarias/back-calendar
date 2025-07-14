const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function criarCheckoutSession(req, res) {
  try {
    const planos = {
      mensal: { nome: 'Mensal', meses: 1, valor: 5 },
      trimestral: { nome: 'Trimestral', meses: 3, valor: 79 },
      semestral: { nome: 'Semestral', meses: 6, valor: 69 },
      anual: { nome: 'Anual', meses: 12, valor: 59 },
    };

    const { plano_id } = req.body;

    const plano = planos[plano_id];
    if (!plano) {
      return res.status(400).json({ erro: 'Plano inválido' });
    }

    const total = plano.valor * plano.meses;

    // Recuperar email do usuário autenticado (simulação por enquanto)
    const email = 'usuario@email.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plano.nome}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/pagamento-sucesso`,
      cancel_url: `${process.env.FRONTEND_URL}/pagamento-cancelado`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Erro ao criar sessão de pagamento:', error);
    res.status(500).json({ erro: 'Erro interno' });
  }
}

module.exports = {
  criarCheckoutSession,
};
