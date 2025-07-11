require('dotenv').config();
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarMensagemWhatsApp(
  numeroDestino,
  nomeCliente,
  area,
  produto,
  empresa,
  area2
) {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${numeroDestino}`,
      contentSid: 'HXb8e360e9803dfdad60caaff3baff5d84',
      contentVariables: JSON.stringify({
        1: nomeCliente,
        2: area,
        3: produto,
        4: empresa,
        5: area2,
      }),
    });
    console.log('Mensagem enviada:', message.sid);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

module.exports = { enviarMensagemWhatsApp };
