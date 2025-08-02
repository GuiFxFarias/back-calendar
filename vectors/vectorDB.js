const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class VectorDB {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/vetores.db');
    this.db = new sqlite3.Database(this.dbPath);

    this.db.run(
      `CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        texto TEXT,
        embedding TEXT
      )`
    );
  }

  limparTodosOsVetores() {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM documentos`;
      this.db.run(sql, function (err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  inserirDocumento(texto, embedding) {
    return new Promise((resolve, reject) => {
      const embeddingStr = JSON.stringify(embedding);
      this.db.run(
        `INSERT INTO documentos (texto, embedding) VALUES (?, ?)`,
        [texto, embeddingStr],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  buscarTodos() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM documentos`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async buscarMaisSimilar(embeddingConsulta) {
    const documentos = await this.buscarTodos();

    const calcularSimilaridade = (a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return -1; // Vetores incompatíveis
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
