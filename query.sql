CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  endereco TEXT
);

CREATE TABLE visitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  data_visita DATETIME NOT NULL,
  preco DECIMAL(10,2),
  descricao TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE fotos_visita (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visita_id INT NOT NULL,
  url_foto TEXT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visita_id) REFERENCES visitas(id)
);

CREATE TABLE mensagens_programadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  texto TEXT NOT NULL,
  dias_intervalo INT NOT NULL,
  ultima_data_envio DATETIME,
  proxima_data_envio DATETIME,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE logs_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mensagem_id INT NOT NULL,
  data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),
  resposta_twilio TEXT,
  FOREIGN KEY (mensagem_id) REFERENCES mensagens_programadas(id)
);

