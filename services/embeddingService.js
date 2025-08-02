require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class EmbeddingService {
  /**
   * Gera embedding vetorial de um texto usando modelo da OpenAI.
   * @param {string} texto - Texto para vetorização.
   * @returns {Promise<number[]>} - Vetor do embedding.
   */
  async gerarEmbedding(texto) {
    if (!texto || typeof texto !== 'string') {
      throw new Error(`❌ Texto inválido para gerar embedding: ${texto}`);
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: [texto],
    });

    return response.data[0].embedding;
  }
}

module.exports = new EmbeddingService();
