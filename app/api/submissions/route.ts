

import { NextRequest, NextResponse } from 'next/server';


  export async function POST(req: NextRequest) {
   
    try {
        const body = await req.json();
        const { path, ...params } = body;

        try {
          const response = await fetch(`http://ec2-52-71-80-229.compute-1.amazonaws.com:2358${path}`, {
            method: req.method,
            headers: {
              'Content-Type': 'application/json',
              // Add any additional headers needed here
            },
            body: req.method === 'POST' ? JSON.stringify(params) : null,
          });
        
          const data = await response.json();
          return NextResponse.json(data);
        } catch (error) {
          console.error('Proxy error:', error);
          return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }
  }
