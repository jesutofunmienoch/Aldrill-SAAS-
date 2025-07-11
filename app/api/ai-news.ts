// pages/api/ai-news.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const question = body.question;

  // Fetch live news (you can use NewsAPI or similar)
  const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_NEWS_API_KEY`);
  const newsData = await newsRes.json();
  const headlines = newsData.articles.map((a: any) => `- ${a.title}`).slice(0, 5).join("\n");

  const systemPrompt = `
    You are a smart AI assistant. Here are the latest news headlines:
    ${headlines}
    
    Answer the user's question based on this info.
  `;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4', // or gpt-3.5-turbo
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    }),
  });

  const responseData = await openaiRes.json();
  return NextResponse.json({ reply: responseData.choices[0].message.content });
}
