const cron = require('node-cron');
const db = require('../conexao');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER;
const TEMPLATE_SID = 'HX33745f4f44dbcfa480ebc631a7f912f5';

cron.schedule('0 * * * *', async () => {
  console.log('⏰ Verificando mensagens programadas...');

  try {
    const mensagens = await new Promise((resolve, reject) => {
      db.query(
        `SELECT mp.*, c.nome AS nome_cliente 
         FROM mensagens_programadas mp
         LEFT JOIN clientes c ON c.id = mp.cliente_id
         WHERE mp.ativo = 1 AND mp.proxima_data_envio <= NOW()`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    for (const msg of mensagens) {
      try {
        // Buscar o número do usuário responsável pelo tenant
        const numeroUsuario = await new Promise((resolve, reject) => {
          db.query(
            `SELECT telefone FROM usuarios WHERE tenant_id = ? LIMIT 1`,
            [msg.tenant_id],
            (err, results) => {
              if (err || results.length === 0)
                return reject('Usuário não encontrado');
              resolve(results[0].telefone);
            }
          );
        });

        const cliente = msg.nome_cliente || 'Cliente';
        const texto = msg.texto?.substring(0, 500) || 'Mensagem padrão';
        const numeroDestino = `${msg.telefone}`;

        const message = await client.messages.create({
          from: FROM_WHATSAPP,
          to: numeroDestino,
          contentSid: TEMPLATE_SID,
          contentVariables: JSON.stringify({
            1: cliente,
            2: texto,
            3: numeroUsuario,
          }),
        });

        console.log(`📤 Mensagem enviada para ${cliente} - ${msg.telefone}`);

        const novaProxima = new Date();
        novaProxima.setDate(novaProxima.getDate() + msg.dias_intervalo);

        await db.execute(
          `UPDATE mensagens_programadas
           SET ultima_data_envio = NOW(),
               proxima_data_envio = ?
           WHERE id = ?`,
          [novaProxima, msg.id]
        );
      } catch (err) {
        console.error('❌ Erro ao processar mensagem:', err.message || err);
      }
    }
  } catch (erro) {
    console.error('❌ Erro geral no agendador:', erro.message);
  }
});
