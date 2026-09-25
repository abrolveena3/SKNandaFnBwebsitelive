// Cloudflare Pages Function: /api/concierge
// Deployed natively on Cloudflare Pages Functions (edge runtime)

interface Env {
  GEMINI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  API_KEY?: string;
}

interface RequestBody {
  message?: string;
  history?: Array<{
    role: 'user' | 'model' | 'assistant';
    content?: string;
    parts?: Array<{ text: string }>;
  }>;
}

const SYSTEM_PROMPT = `You are the Royal Culinary Concierge for SK Nanda Catering (SKN F&B Hospitality), India's premier luxury culinary house established in 1997 by Mr. S.K. Nanda.

Key Entity & Brand Facts:
- Founder: Mr. S.K. Nanda (Managing Director since 1997). Over 28+ years of culinary purism, slow-fire Awadhi dum pukht, artisanal tandoor, and royal Indian banquets.
- Managing Director & Operations: Pratik Nanda. Cold-chain mobility, HACCP certification, remote palace & fort logistics (Udaipur, Jaipur, Goa, Dubai).
- Director & Experiential Gastronomy: Manan Nanda. Modern culinary vanguard, 22+ theatrical live stations, flame-charred Robata grills, truffle wheel pasta, liquid nitrogen dessert installations.
- Address: Farm No. 3, Kh. No. 113/14, Bijwasan Kapashera Village, Behind Oberoi Farm, New Delhi – 110037.
- Phone / Direct WhatsApp: +91 98731 55544 (Direct connection to the directors).
- Cuisines: 200+ dishes across 22 Regional Indian traditions (Awadhi, Kashmiri Wazwan, Royal Rajasthani, Mughlai, Punjabi, Coastal) plus Pan-Asian, Sushi, Robata, European, Truffle Italian, and Mediterranean.
- Occasions: Grand Weddings, Sangeet & Mehendi Bazaars, Cocktail Galas, Corporate Summits, Private Farmhouse Soirées, and Pan-India / International Destination Weddings.

Tone & Instructions:
- Elegant, hospitable, refined, and confident.
- Provide tailored, mouth-watering menu recommendations, guest count guidance, and live station ideas.
- Encourage seamless consultation via WhatsApp (+91 98731 55544) or scheduling an executive tasting at the Bijwasan estate.
- Keep responses concise, evocative, and luxurious (2-4 paragraphs max).`;

// Production-ready active Google Gemini models verified against your project
const MODEL_CASCADE = [
  "gemini-3.8-flash",       // Primary: Fastest & newest Flash model
  "gemini-3.7-flash",       // High-availability backup
  "gemini-3.5-flash",       // Secondary backup
  "gemini-2.5-flash",       // Stable fallback
  "gemini-flash-latest"     // Alias fallback
];

/**
  Executes a single HTTP call to the Gemini REST API
 */
async function singleGeminiCall(
  model: string,
  apiKey: string,
  contents: any[],
  systemInstruction: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s request timeout

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7
    }
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errStatus = response.status;
      const errText = await response.text();
      const err = new Error(`Model ${model} returned HTTP ${errStatus}: ${errText}`);
      (err as any).status = errStatus;
      throw err;
    }

    const data: any = await response.json();
    const candidate = data?.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new Error(`Empty response structure from model ${model}`);
    }

    return textPart;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Wraps singleGeminiCall with Exponential Backoff + Random Jitter for transient errors (429/503)
 */
async function callGeminiWithRetry(
  model: string,
  apiKey: string,
  contents: any[],
  systemInstruction: string,
  maxRetries = 2
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await singleGeminiCall(model, apiKey, contents, systemInstruction);
    } catch (err: any) {
      const status = err?.status || 0;
      const errMsg = err?.message || '';
      
      // Check if error is transient (HTTP 429 Rate Limit / Quota Spikes or HTTP 503 Server Overload)
      const isTransient =
        status === 429 ||
        status === 503 ||
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (!isTransient || attempt === maxRetries) {
        throw err; // Pass error up to step down to the next model in CASCADE
      }

      // Exponential backoff formula: baseDelay * 2^attempt + jitter (0-150ms)
      const baseDelay = 300; // 300ms initial wait
      const jitter = Math.floor(Math.random() * 150);
      const delay = Math.pow(2, attempt) * baseDelay + jitter;

      console.warn(
        `[Concierge Retry] ${model} hit HTTP ${status}. Retrying attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to call ${model} after ${maxRetries} retries.`);
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-goog-api-key'
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
    const apiKey =
      context.env?.GEMINI_API_KEY ||
      context.env?.GOOGLE_API_KEY ||
      context.env?.API_KEY;

    let body: RequestBody = {};
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers }
      );
    }

    const userMessage = (body.message || '').trim();
    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers }
      );
    }

    // Format multi-turn conversation history
    const contents: any[] = [];
    let lastRole: string | null = null;

    if (Array.isArray(body.history)) {
      for (const item of body.history) {
        const text = (
          item.content ||
          (item.parts && item.parts[0]?.text) ||
          ''
        ).trim();

        if (!text) continue;

        // Force strictly 'user' or 'model'
        const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';

        if (role !== lastRole) {
          contents.push({
            role,
            parts: [{ text }]
          });
          lastRole = role;
        } else {
          // Merge consecutive identical roles to prevent Gemini turn sequence errors
          const lastIndex = contents.length - 1;
          contents[lastIndex].parts[0].text += `\n${text}`;
        }
      }
    }

    // Append latest user prompt
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${userMessage}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply: `Welcome to SK Nanda Catering. We orchestrate royal banquets, grand wedding celebrations, and over 22 theatrical live stations across Delhi NCR and internationally. To finalize bespoke menus and reserve tasting dates at our Bijwasan estate, please contact our directors directly on WhatsApp at +91 98731 55544.`,
          source: 'concierge-desk'
        }),
        { status: 200, headers }
      );
    }

    // Iterate through cascade: Each model gets up to 3 tries (1 original + 2 retries with jitter)
    for (const model of MODEL_CASCADE) {
      try {
        const reply = await callGeminiWithRetry(
          model,
          apiKey,
          contents,
          SYSTEM_PROMPT,
          2 // maxRetries
        );
        console.log(`[Concierge Success] Served by model: ${model}`);
        return new Response(
          JSON.stringify({
            reply,
            modelUsed: model,
            source: 'gemini'
          }),
          { status: 200, headers }
        );
      } catch (err: any) {
        console.warn(`[Concierge Cascade] Model ${model} failed after retries:`, err?.message || err);
      }
    }

    // Static fallback if all retries and cascade options are exhausted
    return new Response(
      JSON.stringify({
        reply: `Thank you for reaching out to SK Nanda Catering. Our directors are currently attending to banquet tastings. You can connect with Mr. Pratik Nanda and Mr. Manan Nanda directly on WhatsApp at +91 98731 55544 for instant event consultations and custom menus.`,
        source: 'fallback-concierge'
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error(`[Concierge Fatal Error]:`, err?.message || err);
    return new Response(
      JSON.stringify({
        reply: `Our culinary concierge is momentarily assisting other patrons. Please contact our directors directly on WhatsApp at +91 98731 55544.`
      }),
      { status: 200, headers }
    );
  }
};