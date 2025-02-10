import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [{ role: "system", content: "health check" }],
        max_tokens: 1,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('DeepSeek API health check failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
} 