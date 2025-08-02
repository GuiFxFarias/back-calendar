const fs = require('fs');
const path = require('path');
const vetorDB = require('../vectors/vectorDB');
const embeddingService = require('../services/embeddingService');

async function treinarFrasesIA() {
  const arquivo = path.join(__dirname, '../vectors/training-data.json');

  if (!fs.existsSync(arquivo)) {
    console.error(`❌ Arquivo não encontrado: ${arquivo}`);
    return;
  }

  const intents = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));

  const existentes = await vetorDB.buscarTodos();
  const jaVetorizadas = new Set(
    existentes.map((v) => `${v.texto}|${v.embedding.length}`)
  );

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

      const texto = `frase::${intent}`;
      const chave = `${texto}|${frase.length}`;

      if (jaVetorizadas.has(chave)) {
        console.log(`⏩ Já vetorizada: ${frase}`);
        continue;
      }

      try {
        const embedding = await embeddingService.gerarEmbedding(frase);
        await vetorDB.inserirDocumento(texto, embedding);
        console.log(`✅ Vetorizado: ${texto} -> ${frase}`);
      } catch (err) {
        console.error(`❌ Erro ao vetorizar frase: "${frase}"`, err);
      }
    }
  }

  console.log('🎯 Treinamento finalizado!');
}

treinarFrasesIA();
