require('dotenv').config(); // Isso deve vir antes de qualquer uso de env

const nodemailer = require('nodemailer');

async function enviarEmailTeste() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Teste do Sistema" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '🔧 Teste de envio de e-mail',
      html: '<p>Funcionou! 🚀</p>',
    });

    console.log('📧 Email enviado:', info.response);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
  }
}

module.exports = { enviarEmailTeste };
