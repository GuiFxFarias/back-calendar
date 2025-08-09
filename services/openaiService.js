const MensagemModel = require('../models/mensagemModel');

class ServiceChatIa {
  // compat com o seu método antigo (sem histórico explícito)
  async enviarParaGPT(prompt) {
    return this.enviarParaGPTComHistorico({
      tenant_id: 0, // ajuste conforme seu fluxo (ex.: obrigatório no controller)
      user_id: null,
      userPrompt: prompt,
    });
  }

  async enviarParaGPTComHistorico({
    tenant_id,
    user_id = null,
    userPrompt,
    system = `Você é um assistente do sistema de agendamentos para prestadores de serviço.
Responda de forma clara, objetiva e amigável. Evite negrito/itálico/listas com traços.
Sempre que fizer sentido, traga sugestões práticas sobre organização, cobrança e aumento de receita.`,
    limit = 15,
    model = process.env.OPENAI_MODEL || 'gpt-4o',
    temperature = 0.7,
  }) {
    if (!tenant_id || !userPrompt) {
      return 'Pergunta inválida.';
    }

    // 1) histórico do banco (no seu padrão)
    const history = await MensagemModel.listarUltimas({
      tenant_id,
      user_id,
      limit,
    });

    // 2) montar messages
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    for (const m of history) {
      messages.push({ role: m.role, content: m.content });
    }
    messages.push({ role: 'user', content: userPrompt });

    // 3) salvar pergunta do usuário
    await MensagemModel.registrar({
      tenant_id,
      user_id,
      role: 'user',
      content: userPrompt,
      meta: { tipo: 'entrada_usuario' },
    });

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
          }),
        }
      );

      const data = await response.json();
      if (data?.error) {
        console.error('OpenAI error:', data.error);
        throw new Error(data.error?.message || 'Erro OpenAI');
      }

      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Resposta inválida da OpenAI');

      // 4) salvar resposta do assistente
      await MensagemModel.registrar({
        tenant_id,
        user_id,
        role: 'assistant',
        content,
        meta: { tipo: 'resposta_livre', model, usage: data?.usage || null },
      });

      return content;
    } catch (err) {
      console.error('Erro ao chamar GPT:', err);
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    }
  }
}

module.exports = new ServiceChatIa();
