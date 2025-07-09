const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(to, assunto, html) {
  const mailOptions = {
    from: `"Sistema G-Calendar" <${process.env.EMAIL_USER}>`,
    to,
    subject: assunto,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarEmail };
