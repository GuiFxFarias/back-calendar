const Database = require('better-sqlite3');
const path = require('path');

class VectorDB {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/vetores.db');
    this.db = new Database(this.dbPath);

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS documentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          texto TEXT,
          embedding TEXT
        )`
      )
      .run();
  }

  limparTodosOsVetores() {
    const stmt = this.db.prepare(`DELETE FROM documentos`);
    stmt.run();
    return true;
  }

  inserirDocumento(texto, embedding) {
    const embeddingStr = JSON.stringify(embedding);
    const stmt = this.db.prepare(
      `INSERT INTO documentos (texto, embedding) VALUES (?, ?)`
    );
    const info = stmt.run(texto, embeddingStr);
    return info.lastInsertRowid;
  }

  buscarTodos() {
    const stmt = this.db.prepare(`SELECT * FROM documentos`);
    return stmt.all();
  }

  buscarMaisSimilar(embeddingConsulta) {
    const documentos = this.buscarTodos();

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
