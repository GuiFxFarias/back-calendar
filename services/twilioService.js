require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarMensagemWhatsApp(numeroDestino, mensagem) {
  try {
    const message = await client.messages.create({
      body: mensagem,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${numeroDestino}`,
    });
    console.log('Mensagem enviada:', message.sid);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

module.exports = { enviarMensagemWhatsApp };
