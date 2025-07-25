import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 允许webhook接口公开访问
  if (request.nextUrl.pathname === '/api/webhook/email-received') {
    const response = NextResponse.next();
    
    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/webhook/:path*'
  ],
}; 