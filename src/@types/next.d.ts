// Type definitions for Next.js
// Project: https://nextjs.org

declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string): void;
      delete(name: string): void;
    };
    geo?: {
      city?: string;
      country?: string;
      region?: string;
    };
    ip?: string;
    nextUrl: URL;
    ua?: {
      isBot: boolean;
      ua: string;
      browser: {
        name?: string;
        version?: string;
      };
      device: {
        model?: string;
        type?: string;
        vendor?: string;
      };
      engine: {
        name?: string;
        version?: string;
      };
      os: {
        name?: string;
        version?: string;
      };
      cpu: {
        architecture?: string;
      };
    };
  }

  export class NextResponse extends Response {
    public cookie(name: string, value: string, options?: any): NextResponse;
    public cookies: Map<string, string>;
    
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
} 