const mysql = require('mysql2');

// Cria um pool de conexões
const conexao = mysql.createPool({
  host: 'localhost', // Localhost (ou IP do servidor)
  port: 3306, // Porta padrão do MySQL
  user: 'root', // Usuário do banco
  password: 'Farias!123', // Senha do usuário
  database: 'local_g_calender', // Nome do banco de dados
  waitForConnections: true, // Espera caso todas as conexões estejam ocupadas
  connectionLimit: 10, // Até 10 conexões ao mesmo tempo
  queueLimit: 0, // 0 = sem limite de requisições na fila
});
// Testa a conexão
conexao.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message);
  } else {
    console.log('Conectado ao banco de dados com sucesso!');
    connection.release(); // Libera a conexão de volta para o pool
  }
});

module.exports = conexao;
