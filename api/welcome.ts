import { get } from '@vercel/global-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const greeting = await get('greeting');
    return new Response(
      JSON.stringify({
        success: true,
        greeting: greeting || 'Bem-vindo ao VINA FINACE!',
        source: greeting ? 'vinasystem-global-config' : 'default',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, s-maxage=5, stale-while-revalidate=59',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: true,
        greeting: 'Bem-vindo ao VINA FINACE!',
        source: 'fallback',
        message: error?.message || 'Config not connected',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*',
        },
      }
    );
  }
}
