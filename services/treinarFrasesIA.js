const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const vetorDB = require('../vectors/vectorDB');
const embeddingService = require('../services/embeddingService');

async function treinarFrasesIA() {
  const arquivo = path.join(__dirname, '../vectors/training-data.json');

  if (!fs.existsSync(arquivo)) {
    console.error(`❌ Arquivo não encontrado: ${arquivo}`);
    return;
  }

  const intents = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));

  // 🔍 Busca todos os textos existentes no banco
  const existentes = await vetorDB.buscarTodos(); // [{ id, texto, embedding }]
  const textosVetorizados = new Set(existentes.map((v) => v.texto));

  // 🔧 Frases do JSON (para futura comparação)
  const novasFrases = new Set();

  for (const item of intents) {
    const { intent, frases } = item;

    if (!intent || !Array.isArray(frases)) {
      console.warn('⚠️ Item inválido detectado e ignorado:', item);
      continue;
    }

    for (const frase of frases) {
      if (!frase || typeof frase !== 'string') {
        console.warn('⚠️ Frase inválida ignorada:', frase);
        continue;
      }

      const texto = `frase::${intent}::${frase}`;
      novasFrases.add(texto);

      if (textosVetorizados.has(texto)) {
        console.log(`⏩ Já vetorizada: ${frase}`);
        continue;
      }

      try {
        const embedding = await embeddingService.gerarEmbedding(frase);
        await vetorDB.inserirDocumento(texto, embedding);
        console.log(`✅ Vetorizado: ${texto}`);
      } catch (err) {
        console.error(`❌ Erro ao vetorizar frase: "${frase}"`, err);
      }
    }
  }

  // 🧹 Verifica e remove frases que não existem mais no JSON
  for (const existente of existentes) {
    if (!novasFrases.has(existente.texto)) {
      try {
        await vetorDB.excluirPorTexto(existente.texto);
        console.log(`🗑️ Removido do banco: ${existente.texto}`);
      } catch (err) {
        console.error(`❌ Erro ao remover "${existente.texto}":`, err);
      }
    }
  }

  console.log('🎯 Treinamento finalizado e sincronizado!');
}

treinarFrasesIA();
