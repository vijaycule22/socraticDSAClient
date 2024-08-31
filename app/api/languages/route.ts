// pages/api/proxy.js
import { NextRequest, NextResponse } from 'next/server';


  export async function GET(request: NextRequest) {
   
    try {
        const response = await fetch('http://ec2-52-71-80-229.compute-1.amazonaws.com:2358/languages');
        const data = await response.json();
    
        return NextResponse.json( data );
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }
  }