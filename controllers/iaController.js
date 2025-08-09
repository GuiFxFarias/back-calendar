// controllers/iaController.js
const vetorService = require('../vectors/vetorService');
const iaActions = require('../services/iaActionsByController');
const chatIaService = require('../services/openaiService');
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
  const matchDataDireta = pergunta.match(/\b(\d{1,2})\/(\d{1,2})\/?(\d{4})?\b/);

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
    const user_id = req.user?.id || null;
    const { dia, mes, ano } = extrairMesAnoDia(pergunta);

    console.log('🧠 Pergunta recebida:', pergunta);
    console.log('🏢 Tenant ID:', tenant_id);
    console.log('📅 Data extraída:', { dia, mes, ano });

    if (!pergunta || typeof pergunta !== 'string' || pergunta.trim() === '') {
      return res.status(400).json({ erro: 'Pergunta inválida.' });
    }
    if (!tenant_id) {
      return res.status(400).json({ erro: 'tenant_id é obrigatório.' });
    }

    try {
      // 🔍 Intenção via vetor
      const resultadoSimilar = await vetorService.identificarAcao(pergunta);
      console.log('🧩 Resultado similar:', resultadoSimilar);

      // 🚫 Fora do escopo → conversa natural com histórico
      const acao = resultadoSimilar?.split('::')[1];
      const temAcao = acao && typeof iaActions[acao] === 'function';
      if (!temAcao) {
        console.log('💬 Sem ação mapeada — respondendo com histórico.');
        const respostaLivre = await chatIaService.enviarParaGPTComHistorico({
          tenant_id,
          userPrompt: pergunta,
          // system opcional: deixe vazio para usar o default do service ou passe um custom:
          system: `Você é um assistente do sistema de agendamentos, chamado Peri, para prestadores de serviço.
Responda de forma clara, objetiva e amigável. Evite negrito/itálico/listas com traços.
Sempre que fizer sentido, traga sugestões práticas sobre organização, cobrança e aumento de receita.`,
        });
        return res.json({ resposta: respostaLivre });
      }

      // ✅ Ação definida
      console.log('🎯 Ação identificada:', acao);
      console.log('🚀 Executando ação da IA com:', {
        tenant_id,
        dia,
        mes,
        ano,
      });

      const dados = await iaActions[acao](tenant_id, { dia, mes, ano });
      console.log('📊 Dados retornados da ação:', dados);

      // 🗣️ Resposta consultiva com os dados + histórico
      const promptUsuario = `
      Pergunta do usuário: ${pergunta}

      Dados extraídos do sistema:
      ${dados}

      Instruções:
      - Explique os dados de forma simples e objetiva.
      - Se o status estiver como "pago", trate como confirmação de pagamento; não assuma pendências além do registrado.
      - Não use negrito, itálico ou listas com traços.
            `.trim();

      const respostaFinal = await chatIaService.enviarParaGPTComHistorico({
        tenant_id,
        userPrompt: promptUsuario,
        system: `Você é um assistente,  chamado Peri, especializado em ajudar prestadores de serviço a melhorar sua organização,
        entender melhor suas visitas e otimizar seus ganhos. Mantenha linguagem simples, tom de apoio e objetividade.`,
      });

      console.log('✅ Resposta final pronta!');
      return res.json({ resposta: respostaFinal });
    } catch (err) {
      console.error('❌ Erro na IA:', err);
      return res
        .status(500)
        .json({ erro: 'Erro ao processar pergunta com IA.' });
    }
  }
}

module.exports = new IaController();
