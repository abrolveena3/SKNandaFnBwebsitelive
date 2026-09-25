// Cloudflare Pages Function: /api/save-photo
// Handles photo upload persistence on Cloudflare Pages

interface Env {
  SKN_PHOTOS_KV?: any; // Cloudflare KV namespace if bound
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { key, dataUrl } = await context.request.json();
    if (!key || !dataUrl) {
      return new Response(JSON.stringify({ error: 'Missing key or dataUrl' }), {
        status: 400,
        headers
      });
    }

    // If Cloudflare KV is configured, persist to KV
    if (context.env?.SKN_PHOTOS_KV) {
      await context.env.SKN_PHOTOS_KV.put(key, dataUrl);
    }

    return new Response(JSON.stringify({ success: true, url: dataUrl }), {
      status: 200,
      headers
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Failed to save photo' }), {
      status: 500,
      headers
    });
  }
};
