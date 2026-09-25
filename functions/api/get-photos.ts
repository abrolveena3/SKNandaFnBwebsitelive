// Cloudflare Pages Function: /api/get-photos
// Retrieves photo mappings on Cloudflare Pages

interface Env {
  SKN_PHOTOS_KV?: any;
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const mapping: Record<string, string> = {};
    if (context.env?.SKN_PHOTOS_KV) {
      const keys = await context.env.SKN_PHOTOS_KV.list();
      for (const k of keys.keys) {
        const val = await context.env.SKN_PHOTOS_KV.get(k.name);
        if (val) mapping[k.name] = val;
      }
    }
    return new Response(JSON.stringify(mapping), {
      status: 200,
      headers
    });
  } catch (e: any) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers
    });
  }
};
