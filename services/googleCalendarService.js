const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  expiry_date: process.env.GOOGLE_EXPIRY_DATE,
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

async function criarEventoNoCalendar({
  nomeCliente,
  emailCliente,
  data_visita,
}) {
  const inicio = new Date(data_visita);
  const fim = new Date(inicio.getTime() + 60 * 60 * 1000); // 1 hora depois

  const evento = {
    summary: `Visita agendada com ${nomeCliente}`,
    description: 'Atendimento personalizado agendado com sucesso',
    start: {
      dateTime: inicio.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: fim.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    attendees: [{ email: emailCliente }],
    reminders: { useDefault: true },
  };

  return await calendar.events.insert({
    calendarId: 'primary',
    resource: evento,
    sendUpdates: 'all',
  });
}

module.exports = { criarEventoNoCalendar };
