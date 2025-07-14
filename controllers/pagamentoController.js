const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function criarCheckoutSession(req, res) {
  try {
    const { valor, nome_cliente, email } = req.body;

    if (!valor || !nome_cliente || !email) {
      return res
        .status(400)
        .json({ erro: 'Dados incompletos para pagamento.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Agendamento - ${nome_cliente}`,
            },
            unit_amount: Math.round(valor * 100), // Stripe espera centavos
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
    res.status(500).json({ erro: 'Erro ao criar sessão de pagamento' });
  }
}

module.exports = {
  criarCheckoutSession,
};
