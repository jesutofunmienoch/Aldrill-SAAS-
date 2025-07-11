export async function POST(req: Request) {
  try {
    // 1. Parse incoming messages
    const { messages } = await req.json();
    console.log('[RAW MESSAGES]', messages);

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ reply: null, error: 'No messages provided' }), { status: 400 });
    }

    // 2. Format for OpenAI
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
    console.log('[FORMATTED MESSAGES]', formattedMessages);

    // 3. Get the last message from user
    const userLastMessage = messages[messages.length - 1].content;

    // 4. Check if document was uploaded
    const hasDocument = true;
const documentContext = userLastMessage;


    // 5. If document is missing, use news context fallback
    let messagesToSend = [];

    if (!hasDocument) {
      // 📰 Fetch real-time news headlines
      const newsRes = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );
      const news = await newsRes.json();

      const newsContext = `
You're an AI assistant with access to real-time news.
Here are the top headlines right now:
${news.articles.map((a: any) => `- ${a.title}`).join('\n')}
Use this context to answer the user's latest message.
      `.trim();

      messagesToSend = [
        { role: 'system', content: newsContext },
        { role: 'user', content: userLastMessage }
      ];
    } else {
      // 🧠 Use document context
      messagesToSend = [
        {
          role: 'system',
          content:
            "You're an AI assistant. Use only the uploaded document context below to answer the user's query.",
        },
        {
          role: 'user',
          content: documentContext,
        },
      ];
    }

    // 6. Call OpenAI
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messagesToSend,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    console.log('[OPENAI RESPONSE]', data);

    // 7. Handle API error
    if (data.error) {
      console.error('[OPENAI ERROR]', data.error);
      return new Response(
        JSON.stringify({ reply: null, error: data.error.message }),
        { status: 500 }
      );
    }

    // 8. Return AI reply
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('[NO MESSAGE CONTENT]', data);
      return new Response(JSON.stringify({ reply: null }), { status: 500 });
    }

    return Response.json({ reply });

  } catch (error: any) {
    console.error('[CHAT_API_ERROR]', error);
    return new Response(
      JSON.stringify({ reply: null, error: 'Unexpected server error' }),
      { status: 500 }
    );
  }
}
