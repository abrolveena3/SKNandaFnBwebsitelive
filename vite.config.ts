import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'mpa-and-photo-storage',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const pathName = url.split('?')[0];
            const query = url.includes('?') ? '?' + url.split('?')[1] : '';

            if (pathName === '/api/concierge' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const message = (parsed.message || '').trim();
                  const history = parsed.history || [];

                  const apiKey =
                    process.env.GEMINI_API_KEY ||
                    process.env.GOOGLE_API_KEY ||
                    process.env.API_KEY ||
                    '';

                  const contents: any[] = [];
                  if (Array.isArray(history)) {
                    for (const item of history) {
                      const text =
                        item.content ||
                        (item.parts && item.parts[0]?.text) ||
                        '';
                      if (text) {
                        contents.push({
                          role: item.role === 'assistant' ? 'model' : 'user',
                          parts: [{text}],
                        });
                      }
                    }
                  }
                  contents.push({
                    role: 'user',
                    parts: [{text: message || 'Hello'}],
                  });

                  const systemPrompt = `You are the Royal Culinary Concierge for SK Nanda Catering (SKN F&B Hospitality), India's premier luxury culinary house established in 1997 by Mr. S.K. Nanda. Founders: Mr. SK Nanda (1997), Pratik Nanda (MD & Operations), Manan Nanda (Experiential Gastronomy). 200+ dishes across 22 regional Indian cuisines & global flavours. 22 live stations. Phone / WhatsApp: +91 98731 55544. Address: Farm No. 3, Bijwasan Kapashera Village, Behind Oberoi Farm, New Delhi – 110037. Provide regal, hospitable, mouth-watering guidance.`;

                  // Exact model cascade requested:
                  const models = [
                    'gemini-2.5-flash-lite',
                    'gemini-2.5-flash',
                    'gemini-flash-latest',
                  ];

                  let reply = '';
                  let usedModel = '';

                  if (apiKey) {
                    for (const model of models) {
                      try {
                        const controller = new AbortController();
                        const timer = setTimeout(
                          () => controller.abort(),
                          20000
                        ); // 20s timeout

                        const resApi = await fetch(
                          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-goog-api-key': apiKey,
                            },
                            body: JSON.stringify({
                              contents,
                              systemInstruction: {
                                parts: [{text: systemPrompt}],
                              },
                              generationConfig: {
                                maxOutputTokens: 2048,
                                temperature: 0.7,
                                thinkingConfig: {
                                  thinkingBudget: 0,
                                },
                              },
                            }),
                            signal: controller.signal,
                          }
                        );
                        clearTimeout(timer);

                        if (resApi.ok) {
                          const data: any = await resApi.json();
                          const candidateText =
                            data?.candidates?.[0]?.content?.parts?.[0]?.text;
                          if (candidateText) {
                            reply = candidateText;
                            usedModel = model;
                            break;
                          }
                        }
                      } catch (err) {
                        // Cascade to next model
                      }
                    }
                  }

                  if (!reply) {
                    reply =
                      'Welcome to SK Nanda Catering. We orchestrate royal banquets, grand wedding celebrations, and over 22 theatrical live stations across Delhi NCR and internationally. To finalize bespoke menus and reserve tasting dates at our Bijwasan estate, please contact our directors directly on WhatsApp at +91 98731 55544.';
                  }

                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.end(
                    JSON.stringify({
                      reply,
                      modelUsed: usedModel || 'concierge-desk',
                    })
                  );
                  return;
                } catch (e) {
                  res.writeHead(200, {'Content-Type': 'application/json'});
                  res.end(
                    JSON.stringify({
                      reply:
                        'Thank you for contacting SK Nanda Catering. Please reach out directly on WhatsApp at +91 98731 55544 for immediate consultation.',
                    })
                  );
                }
              });
              return;
            }

            if (pathName === '/api/save-photo' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const {key, dataUrl} = JSON.parse(body);
                  if (key && dataUrl) {
                    const uploadsDir = path.resolve(import.meta.dirname, 'public/uploads');
                    if (!fs.existsSync(uploadsDir)) {
                      fs.mkdirSync(uploadsDir, {recursive: true});
                    }
                    const mappingFile = path.join(uploadsDir, 'photos.json');
                    let mapping: Record<string, string> = {};
                    if (fs.existsSync(mappingFile)) {
                      try {
                        mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
                      } catch {}
                    }

                    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const buffer = Buffer.from(matches[2], 'base64');
                      const fileName = `${key}.jpg`;
                      fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
                      mapping[key] = `/uploads/${fileName}?t=${Date.now()}`;
                    } else {
                      mapping[key] = dataUrl;
                    }

                    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true, url: mapping[key]}));
                    return;
                  }
                } catch (e) {
                  console.error('Error saving photo:', e);
                }
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Invalid payload'}));
              });
              return;
            }

            if (pathName === '/api/get-photos' && req.method === 'GET') {
              const mappingFile = path.resolve(import.meta.dirname, 'public/uploads/photos.json');
              let mapping: Record<string, string> = {};
              if (fs.existsSync(mappingFile)) {
                try {
                  mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
                } catch {}
              }
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(mapping));
              return;
            }

            if (pathName.startsWith('/uploads/')) {
              const decodedPath = decodeURIComponent(pathName);
              const filePath = path.resolve(import.meta.dirname, 'public' + decodedPath);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                res.writeHead(200, {'Content-Type': mimeType});
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }

            if (pathName === '/about') {
              req.url = '/about/' + query;
            } else if (pathName === '/careers') {
              req.url = '/careers/' + query;
            } else if (pathName === '/menu') {
              req.url = '/menu/' + query;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          about: path.resolve(import.meta.dirname, 'about/index.html'),
          careers: path.resolve(import.meta.dirname, 'careers/index.html'),
          menu: path.resolve(import.meta.dirname, 'menu/index.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
