import { NextRequest, NextResponse } from 'next/server';
import { Script } from 'vm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    const script = new Script(code);
    const result = script.runInNewContext({});

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  return new Response('Hi, Welcome to nextjs server', {
    headers: { 'content-type': 'text/plain' },
  });
}