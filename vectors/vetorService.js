const vectorDB = require('./vectorDB');
const embeddingService = require('../services/embeddingService');

class VetorService {
  /**
   * Identifica a ação mais similar à pergunta fornecida, com base em embeddings.
   * @param {string} pergunta
   * @returns {Promise<string>} Nome da ação ou 'fora_do_escopo'
   */
  async identificarAcao(pergunta) {
    if (!pergunta || typeof pergunta != 'string') {
      throw new Error(`❌ Pergunta inválida: ${pergunta} `);
    }

    const embedding = await embeddingService.gerarEmbedding(pergunta);
    const resultado = await vectorDB.buscarMaisSimilar(embedding);

    if (!resultado || resultado.similaridade < 0.8) {
      return 'fora_do_escopo';
    }

    // Esperado: "ação::nome_da_acao"
    const match = resultado.texto.match(/^ação::(.+)$/);
    return match ? match[1] : resultado.texto;
  }
}

module.exports = new VetorService();
