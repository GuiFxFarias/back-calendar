const googleapis = require('googleapis');

const oAuth2Client = new googleapis.google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  expiry_date: process.env.GOOGLE_EXPIRY_DATE,
});

const calendar = googleapis.google.calendar({
  version: 'v3',
  auth: oAuth2Client,
});

class AgendarNoGoogle {
  async criarEventoNoCalendar({ nomeCliente, emailCliente, data_visita }) {
    try {
      const inicio = new Date(data_visita);
      const fim = new Date(inicio.getTime() + 60 * 60 * 1000); // 1h

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

      console.log('📆 Criando evento:', evento);

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: evento,
        sendUpdates: 'all',
      });

      console.log('✅ Evento criado:', response.data.htmlLink);
      return response.data;
    } catch (error) {
      console.error(
        '❌ Erro ao criar evento no Google Calendar:',
        error.message
      );
      if (error.response?.data) {
        console.error('🪵 Detalhes:', error.response.data);
      }
      throw error;
    }
  }
}

module.exports = new AgendarNoGoogle();
