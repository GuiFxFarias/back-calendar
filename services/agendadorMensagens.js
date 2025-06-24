const cron = require('node-cron');
const db = require('../conexao');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER;

cron.schedule('* * * * *', async () => {
  console.log('⏰ Verificando mensagens programadas...');

  const mensagens = await new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM mensagens_programadas WHERE ativo = 1 AND proxima_data_envio <= NOW()`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });

  console.log('🔍 Resultado bruto da query:', mensagens);

  try {
    const mensagens = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM mensagens_programadas WHERE ativo = 1 AND proxima_data_envio <= NOW()`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    for (const msg of mensagens) {
      try {
        await client.messages.create({
          body: msg.texto,
          from: FROM_WHATSAPP,
          to: msg.telefone,
        });

        console.log(`📤 Mensagem enviada para ${msg.telefone}`);

        const novaProxima = new Date();
        novaProxima.setDate(novaProxima.getDate() + msg.dias_intervalo);

        await db.execute(
          `
          UPDATE mensagens_programadas
          SET ultima_data_envio = NOW(),
              proxima_data_envio = ?
          WHERE id = ?
        `,
          [novaProxima, msg.id]
        );
      } catch (twilioErr) {
        console.error(
          '❌ Erro ao enviar mensagem via Twilio:',
          twilioErr.message
        );
      }
    }
  } catch (erro) {
    console.error('Erro ao executar agendador:', erro.message);
  }
});
