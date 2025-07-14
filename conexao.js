const mysql = require('mysql2');

// Carrega as variáveis de ambiente do .env
require('dotenv').config();

// Cria um pool de conexões usando as variáveis do Railway
const conexao = mysql.createPool({
  host: process.env.DB_HOST, // Ex: 'metro.proxy.rlwy.net'
  port: process.env.DB_PORT || 3306, // Ex: '56556'
  user: process.env.DB_USER, // Ex: 'root'
  password: process.env.DB_PASSWORD, // Sua senha
  database: process.env.DB_NAME, // Ex: 'railway'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testa a conexão
conexao.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados com sucesso!');
    connection.release();
  }
});

module.exports = conexao;
