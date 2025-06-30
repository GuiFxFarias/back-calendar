require('dotenv').config();
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function enviarMensagemWhatsApp(numeroDestino, nomeAniversariante) {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${numeroDestino}`,
      contentSid: 'HXc68b3a2dbb784906ead41e5482b62921',
      contentVariables: JSON.stringify({
        1: nomeAniversariante,
      }),
    });
    console.log('Mensagem enviada:', message.sid);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

module.exports = { enviarMensagemWhatsApp };
