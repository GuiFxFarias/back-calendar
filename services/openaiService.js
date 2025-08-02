class ServiceChatIa {
  async enviarParaGPT(prompt) {
    //Puxar do banco o historico

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
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error('Resposta inválida da OpenAI');
      }

      // Preencher o historico no banco

      return data.choices[0].message.content;
    } catch (err) {
      console.error('Erro ao chamar GPT:', err);
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    }
  }
}

module.exports = new ServiceChatIa();
