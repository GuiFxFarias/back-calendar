const vetorDB = require('./vectorDB');
const embeddingService = require('../services/embeddingService');

async function vetorizarAcoes() {
  const acoes = ['visitas_amanha'];

  console.log('🔍 Buscando vetores já existentes...');
  const vetoresExistentes = await vetorDB.buscarTodos();
  const textosExistentes = new Set(vetoresExistentes.map((v) => v.texto));

  for (const acao of acoes) {
    const textoSalvo = `ação::${acao}`;

    if (textosExistentes.has(textoSalvo)) {
      console.log(`⏩ Já existente: ${textoSalvo}`);
      continue;
    }

    const textoDescricao = gerarDescricaoDaAcao(acao);
    const embedding = await embeddingService.gerarEmbedding(textoDescricao);

    await vetorDB.inserirDocumento(textoSalvo, embedding);

    console.log(`✅ Vetorizado: ${textoSalvo}`);
  }

  console.log('🎉 Vetorização finalizada!');
}

function gerarDescricaoDaAcao(acao) {
  const descricoes = {
    visitas_amanha: 'Quantas visitas estão agendadas para amanhã?',
  };

  return descricoes[acao] || acao.replace(/_/g, ' ');
}

vetorizarAcoes();
