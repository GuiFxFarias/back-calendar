require('dotenv').config();
const router = require('./routers/indexRotas.js');
const cors = require('cors');
const { enviarMensagemWhatsApp } = require('./services/twilioService.js');

// require('./services/agendadorMensagens.js');

const express = require('express');
const { enviarEmailTeste } = require('./services/testeEmail.js');
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

router(app, express);

const PORT = 3001;
app.listen(PORT, (error) => {
  if (error) {
    console.log('Error running server');
    return;
  }

  // enviarEmailTeste();
  // enviarMensagemWhatsApp(
  //   '+5516988447335',
  //   'Farias',
  //   'Equipe de dev',
  //   'Teste produto',
  //   'Minha empresa',
  //   'Equipe'
  // );

  console.log(`✅ Server is running on port ${PORT}`);
});
