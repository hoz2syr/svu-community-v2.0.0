/**
 * Supabase Edge Function — Gemini Proxy
 * يحمي GEMINI_API_KEY من العميل عبر تمرير الطلبات عبر هذا الوسيط
 *
 * النشر:
 *   supabase functions deploy gemini-proxy
 *   supabase secrets set GEMINI_API_KEY=your-key
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3001'];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { base64Image } = await req.json();

    if (!base64Image || typeof base64Image !== 'string' || base64Image.length < 100) {
      return new Response(
        JSON.stringify({ error: 'INVALID_IMAGE_DATA' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/png';

    const prompt = `Extract university schedule information from this image.
Identify the student's major (if available) and a list of courses.
For each course, extract: courseCode, courseName, section, instructor, time.
Return ONLY valid JSON: { "major": "...", "courses": [{ "code": "...", "name": "...", "section": "...", "instructor": "...", "time": "..." }] }`;

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const status = geminiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_QUOTA_EXCEEDED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (status === 403 || status === 401) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY_INVALID' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({ error: `GEMINI_HTTP_ERROR: ${status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await geminiResponse.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_NO_RESPONSE' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let parsed: { major?: string; courses?: unknown };
    try {
      parsed = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: 'GEMINI_INVALID_JSON' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[gemini-proxy] Error:', err);
    return new Response(
      JSON.stringify({ error: 'GEMINI_NETWORK_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
