import { NextResponse } from 'next/server';

const NEAR_AI_API_URL = 'https://cloud-api.near.ai/v1/chat/completions';
const NEAR_AI_MODEL = 'deepseek-ai/DeepSeek-V3.1';

export async function POST(request: Request) {
    try {
        const apiKey =
            process.env.NEAR_AI_API_KEY || process.env.NEXT_PUBLIC_NEAR_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'NEAR AI API key not configured on server' },
                { status: 500 }
            );
        }

        const body = await request.json();

        const response = await fetch(NEAR_AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: NEAR_AI_MODEL,
                ...body,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: `NEAR AI API error: ${response.status} - ${text}` },
                { status: 500 }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in /api/near-ai:', error);
        return NextResponse.json(
            { error: 'Unexpected error while calling NEAR AI' },
            { status: 500 }
        );
    }
}


