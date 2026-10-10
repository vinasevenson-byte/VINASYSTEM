import { get, getAll } from '@vercel/global-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  try {
    if (key) {
      const val = await get(key);
      return new Response(
        JSON.stringify({ success: true, key, value: val }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*',
          },
        }
      );
    }
    const all = await getAll();
    return new Response(
      JSON.stringify({ success: true, config: all }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        source: 'fallback',
        message: error?.message || 'Global config not available',
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
