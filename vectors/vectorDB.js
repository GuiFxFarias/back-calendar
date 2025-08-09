require('dotenv').config();
const conexao = require('../conexao');

class VectorDB {
  executaQuery(sql, parametros) {
    return new Promise((res, rej) => {
      conexao.query(sql, parametros, (error, results) => {
        if (error) {
          console.log('Erro na query: ' + error);
          return rej(error);
        }
        return res(results);
      });
    });
  }

  async criarTabela() {
    const sql = `
      CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        texto TEXT,
        embedding TEXT
      )
    `;
    await this.executaQuery(sql);
  }

  limparTodosOsVetores() {
    const sql = `DELETE FROM documentos`;
    return this.executaQuery(sql);
  }

  inserirDocumento(texto, embedding) {
    const embeddingStr = JSON.stringify(embedding);
    const sql = `INSERT INTO documentos (texto, embedding) VALUES (?, ?)`;
    return this.executaQuery(sql, [texto, embeddingStr]);
  }

  buscarTodos() {
    const sql = `SELECT * FROM documentos`;
    return this.executaQuery(sql);
  }

  excluirPorTexto(texto) {
    const sql = `DELETE FROM documentos WHERE texto = ?`;
    return this.executaQuery(sql, [texto]);
  }

  async buscarMaisSimilar(embeddingConsulta) {
    const documentos = await this.buscarTodos();

    const calcularSimilaridade = (a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return -1;
      }

      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

      return magA === 0 || magB === 0 ? -1 : dotProduct / (magA * magB);
    };

    let maisSimilar = null;
    let maiorSimilaridade = -1;

    for (const doc of documentos) {
      let vetor;
      try {
        vetor = JSON.parse(doc.embedding);
      } catch (err) {
        console.warn(
          `❌ Erro ao parsear embedding do documento ID ${doc.id}:`,
          err
        );
        continue;
      }

      const similaridade = calcularSimilaridade(vetor, embeddingConsulta);

      if (similaridade > maiorSimilaridade) {
        maiorSimilaridade = similaridade;
        maisSimilar = { ...doc, similaridade };
      }
    }

    return maisSimilar;
  }
}

module.exports = new VectorDB();
