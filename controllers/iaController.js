const { enviarParaGPT } = require('../services/openaiService');
const vetorService = require('../vectors/vetorService');
const iaActions = require('../services/iaActionsByController');

function extrairMesAnoDia(pergunta) {
  const meses = {
    janeiro: 1,
    fevereiro: 2,
    março: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
  };

  const regexMes = new RegExp(`(${Object.keys(meses).join('|')})`, 'i');
  const matchMes = pergunta.match(regexMes);
  const matchDia = pergunta.match(/\bdia\s+(\d{1,2})\b/i);
  const matchDataDireta = pergunta.match(/\b(\d{1,2})\/(\d{1,2})\/?(\d{4})?\b/); // 02/08/2025

  const hoje = new Date();
  let dia = hoje.getDate();
  let mes = hoje.getMonth() + 1;
  let ano = hoje.getFullYear();

  if (matchDataDireta) {
    dia = parseInt(matchDataDireta[1]);
    mes = parseInt(matchDataDireta[2]);
    if (matchDataDireta[3]) ano = parseInt(matchDataDireta[3]);
  } else {
    if (matchDia) dia = parseInt(matchDia[1]);
    if (matchMes) mes = meses[matchMes[1].toLowerCase()];
  }

  return { dia, mes, ano };
}

class IaController {
  async perguntar(req, res) {
    const { pergunta, tenant_id } = req.body;
    const { dia, mes, ano } = extrairMesAnoDia(pergunta);

    if (!pergunta || typeof pergunta !== 'string' || pergunta.trim() === '') {
      return res.status(400).json({ erro: 'Pergunta inválida.' });
    }

    try {
      // 🔎 Gera embedding da pergunta e busca similar
      const resultadoSimilar = await vetorService.identificarAcao(pergunta);

      if (!resultadoSimilar) {
        const respostaLivre = await enviarParaGPT(pergunta);
        return res.json({ resposta: respostaLivre });
      }

      // ✅ Alterado aqui: pegamos a ação diretamente
      const acao = resultadoSimilar?.split('::')[1];

      if (!acao || typeof iaActions[acao] !== 'function') {
        const respostaLivre = await enviarParaGPT(pergunta);
        return res.json({ resposta: respostaLivre });
      }

      console.log(acao);
      console.log('[DEBUG IA] Ação identificada:', resultadoSimilar);
      console.log(
        '[DEBUG IA] Função existe:',
        typeof iaActions[acao] === 'function'
      );

      const dados = await iaActions[acao](tenant_id, { dia, mes, ano });

      const respostaFinal = await enviarParaGPT(`
      Pergunta: ${pergunta}
      Dados do sistema: ${dados}
      Responda de forma clara e amigável ao usuário.
      `);

      return res.json({ resposta: respostaFinal });
    } catch (err) {
      console.error('Erro na IA:', err);
      return res
        .status(500)
        .json({ erro: 'Erro ao processar pergunta com IA.' });
    }
  }
}

module.exports = new IaController();
