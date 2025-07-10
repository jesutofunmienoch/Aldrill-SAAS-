export async function POST(req: Request) {
  try {
    // 1. Parse messages from request
    const { messages } = await req.json();
    console.log('[RAW MESSAGES]', messages);

    // 2. Convert to OpenAI format
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    console.log('[FORMATTED MESSAGES]', formattedMessages);

    // 3. Send request to OpenAI API
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
      }),
    });

    const data = await res.json();

    // 4. Log full OpenAI response
    console.log('[OPENAI RESPONSE]', data);

    // 5. Handle OpenAI errors (like quota, key, model, etc.)
    if (data.error) {
      console.error('[OPENAI ERROR]', data.error);
      return new Response(
        JSON.stringify({ reply: null, error: data.error.message }),
        { status: 500 }
      );
    }

    // 6. Ensure valid response content
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('[NO MESSAGE CONTENT]', data);
      return new Response(JSON.stringify({ reply: null }), { status: 500 });
    }

    // 7. Return assistant message
    return Response.json({ reply: data.choices[0].message.content });

  } catch (error) {
    // 8. Catch unexpected errors
    console.error('[CHAT_API_ERROR]', error);
    return new Response(JSON.stringify({ reply: null }), { status: 500 });
  }
}
